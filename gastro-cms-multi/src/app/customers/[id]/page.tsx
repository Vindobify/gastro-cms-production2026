import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customerId = parseInt(id);

  if (isNaN(customerId)) {
    notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders.reduce((sum, order) => {
    return sum + Number(order.totalAmount || 0);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/customers"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Zurück zu Kunden
            </Link>
          </div>
          <Link
            href={`/customers/edit/${customer.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Bearbeiten
          </Link>
        </div>

        {/* Customer Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
          
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
              </div>
              
              {customer.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
                </div>
              )}
              
              {customer.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                    {customer.postalCode && ` ${customer.postalCode}`}
                    {customer.country && `, ${customer.country}`}
                  </dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Registriert</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString('de-DE')}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Gesamtausgaben</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  €{totalSpent.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Letzte Bestellungen</h2>
          </div>
          
          <div className="px-6 py-4">
            {customer.orders.length > 0 ? (
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Bestellung #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          €{Number(order.totalAmount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status === 'DELIVERED' ? 'Geliefert' :
                           order.status === 'PENDING' ? 'Ausstehend' :
                           order.status === 'CANCELLED' ? 'Storniert' :
                           order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'Artikel' : 'Artikel'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Noch keine Bestellungen vorhanden.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
