import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  // Setze SSE-Header
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  };

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(event));
      };

      // Sende initiale Daten
      const sendInitialData = async () => {
        try {
          let where: any = { isActive: true };
          if (driverId) {
            where.id = parseInt(driverId);
          }

          const drivers = await prisma.deliveryDriver.findMany({
            where,
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              profile: true,
              assignedOrders: {
                where: {
                  status: {
                    in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
                  }
                },
                include: {
                  customer: true
                }
              }
            }
          });

          const transformedDrivers = drivers.map(driver => ({
            id: driver.id,
            firstName: driver.user.profile?.firstName || '',
            lastName: driver.user.profile?.lastName || '',
            isAvailable: driver.isAvailable,
            currentLocation: driver.currentLocation ? JSON.parse(driver.currentLocation) : null,
            lastLocationUpdate: driver.lastLocationUpdate,
            assignedOrdersCount: driver.assignedOrders.length,
            assignedOrders: driver.assignedOrders.map(order => ({
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              customerName: `${order.customer.firstName} ${order.customer.lastName}`,
              customerAddress: order.customer.address,
              customerCity: order.customer.city,
              customerPostalCode: order.customer.postalCode,
              totalAmount: order.totalAmount
            }))
          }));

          sendEvent({
            type: 'INITIAL_DATA',
            data: transformedDrivers
          });
        } catch (error) {
          console.error('Error sending initial data:', error);
        }
      };

      // Sende initiale Daten
      sendInitialData();

      // Polling alle 10 Sekunden für Updates
      const interval = setInterval(async () => {
        try {
          let where: any = { isActive: true };
          if (driverId) {
            where.id = parseInt(driverId);
          }

          const drivers = await prisma.deliveryDriver.findMany({
            where,
            select: {
              id: true,
              currentLocation: true,
              lastLocationUpdate: true,
              isAvailable: true,
              assignedOrders: {
                where: {
                  status: {
                    in: ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']
                  }
                },
                select: {
                  id: true,
                  orderNumber: true,
                  status: true
                }
              }
            }
          });

          const updates = drivers.map(driver => ({
            id: driver.id,
            currentLocation: driver.currentLocation ? JSON.parse(driver.currentLocation) : null,
            lastLocationUpdate: driver.lastLocationUpdate,
            isAvailable: driver.isAvailable,
            assignedOrdersCount: driver.assignedOrders.length
          }));

          sendEvent({
            type: 'UPDATE',
            data: updates
          });
        } catch (error) {
          console.error('Error sending update:', error);
        }
      }, 10000); // 10 Sekunden

      // Cleanup bei Verbindungsabbruch
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
}
