import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyToken } from '@/lib/jwt';
import { getTenant } from '@/lib/tenant';

type Connection = {
  controller: ReadableStreamDefaultController;
  key: string;
};

// Key: `${tenantId}:${orderId}`
const connections = new Map<string, Set<Connection>>();

const buildKey = (tenantId: string, orderId: string) => `${tenantId}:${orderId}`;

const removeConnection = (connection: Connection) => {
  const existing = connections.get(connection.key);
  if (existing) {
    existing.delete(connection);
    if (existing.size === 0) {
      connections.delete(connection.key);
    }
  }
  try {
    connection.controller.close();
  } catch (error) {
    console.error('❌ Fehler beim Schließen der SSE-Verbindung:', error);
  }
};

// OPTIONS handler für CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { error: 'orderId ist erforderlich' },
      { status: 400 }
    );
  }

  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const token = request.cookies.get('auth-token')?.value;
  const isAllStream = orderId === 'all';

  if (isAllStream) {
  if (!token) {
    return NextResponse.json(
      { error: 'Nicht authentifiziert' },
      { status: 401 }
    );
  }
  try {
      verifyToken(token);
  } catch (error) {
    console.error('JWT-Verifizierungsfehler:', error);
    return NextResponse.json(
      { error: 'Ungültiger Token' },
      { status: 401 }
    );
  }
  } else {
    // Öffentlicher Stream für eine einzelne Bestellung, aber tenant-gebunden und validiert
    const numericId = Number.isFinite(Number(orderId)) ? Number(orderId) : null;
    const order = await prisma.order.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          numericId ? { id: numericId } : undefined,
          { orderNumber: orderId }
        ].filter(Boolean) as any
      },
      select: { id: true }
    });

    if (!order) {
    return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
    );
    }
  }

  // SSE-Verbindung wird aufgebaut
  const encoder = new TextEncoder();
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let currentConnection: Connection | null = null;
  const connectionKey = buildKey(tenant.id, orderId);

  const stream = new ReadableStream({
    start(controller) {
      const connection: Connection = { controller, key: connectionKey };
      currentConnection = connection;

      const existing = connections.get(connectionKey) ?? new Set<Connection>();
      existing.add(connection);
      connections.set(connectionKey, existing);

      try {
        const initialMessage = `data: ${JSON.stringify({
          type: 'connected',
          message: 'Verbindung hergestellt',
          orderId,
          timestamp: new Date().toISOString()
        })}\n\n`;

        controller.enqueue(encoder.encode(initialMessage));

        heartbeatInterval = setInterval(() => {
          try {
            if (controller.desiredSize !== null && !request.signal.aborted) {
              const heartbeatMessage = `data: ${JSON.stringify({
                type: 'heartbeat',
                message: 'Verbindung aktiv',
                orderId,
                timestamp: new Date().toISOString()
              })}\n\n`;
              controller.enqueue(encoder.encode(heartbeatMessage));
            } else {
              if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
              }
              removeConnection(connection);
            }
          } catch (error) {
            console.error('❌ Fehler beim Senden des Heartbeats:', error);
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }
            removeConnection(connection);
          }
        }, 30000);

        const cleanup = () => {
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
          removeConnection(connection);
        };

        request.signal.addEventListener('abort', cleanup);
      } catch (error) {
        console.error('❌ Fehler beim Initialisieren der SSE-Verbindung:', error);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        removeConnection(connection);
      }
    },

    cancel() {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      if (currentConnection) {
        removeConnection(currentConnection);
        currentConnection = null;
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'X-Accel-Buffering': 'no'
    }
  });
}

// Funktion zum Senden von Updates an alle verbundenen Clients
export async function broadcastUpdate(orderId: string, tenantId: string, updateType: string, data: any) {
  const message = JSON.stringify({
    type: updateType,
    orderId,
    order: data,
    timestamp: new Date().toISOString()
  });

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(`data: ${message}\n\n`);

  const targets = [
    buildKey(tenantId, orderId),
    buildKey(tenantId, 'all')
  ];

  let successCount = 0;
  let errorCount = 0;

  targets.forEach((key) => {
    const set = connections.get(key);
    if (!set) return;

    set.forEach((connection) => {
    try {
        connection.controller.enqueue(encodedMessage);
      successCount++;
    } catch (error) {
      console.error(`❌ Fehler beim Senden an Client:`, error);
      errorCount++;
        removeConnection(connection);
    }
  });
  });

  console.log(`✅ Update gesendet: ${successCount} erfolgreich, ${errorCount} Fehler. Aktive Streams: ${connections.size}`);
}

// Funktion zum Senden von Updates an spezifische Bestellungen
export async function sendOrderUpdate(orderId: string, tenantId: string, updateType: string, data: any) {
  await broadcastUpdate(orderId, tenantId, updateType, data);
}
