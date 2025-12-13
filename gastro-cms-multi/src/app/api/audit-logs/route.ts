// Audit-Logs API für Admin-Interface
import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, getAuditStats } from '@/lib/auditLog';
import { createProtectedHandler, AUTH_CONFIGS } from '@/lib/apiAuth';

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter-Parameter extrahieren
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const stats = searchParams.get('stats');
    
    // Statistiken abrufen
    if (stats === 'true') {
      const auditStats = await getAuditStats();
      return NextResponse.json(auditStats);
    }
    
    // Filter-Objekt erstellen
    const filters: any = {};
    
    if (userId) {
      filters.userId = parseInt(userId);
    }
    
    if (action) {
      filters.action = action;
    }
    
    if (resource) {
      filters.resource = resource;
    }
    
    if (limit) {
      filters.limit = parseInt(limit);
    }
    
    if (offset) {
      filters.offset = parseInt(offset);
    }
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    
    // Audit-Logs abrufen
    const logs = await getAuditLogs(filters);
    
    return NextResponse.json({
      logs,
      count: logs.length,
      filters: filters
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Audit-Logs' },
      { status: 500 }
    );
  }
}

// Nur Admins können Audit-Logs einsehen
export const GET = createProtectedHandler(AUTH_CONFIGS.ADMIN_ONLY, handleGET);
