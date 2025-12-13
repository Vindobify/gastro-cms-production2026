import { NextRequest, NextResponse } from 'next/server';
import { leadQueries, orderQueries, customerQueries, invoiceQueries } from '@/lib/database';

// Type definitions for database objects
interface Lead {
  id: number;
  restaurant_name: string;
  contact_email: string;
  phone?: string;
  monthly_revenue: number;
  current_commission: number;
  current_cost: number;
  gastro_cost: number;
  savings: number;
  savings_percentage: number;
  yearly_savings: number;
  status: string;
  wants_call: boolean;
  call_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  restaurant_name: string;
  owner_name?: string;
  email: string;
  phone?: string;
  address?: string;
  order_details?: string;
  total_amount: number;
  status: string;
  notes?: string;
  monthly_revenue?: number;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: number;
  restaurant_name: string;
  owner_name?: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  subscription_plan?: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: number;
  customer_id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date?: string;
  paid_date?: string;
  description?: string;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

async function getDashboardStats(request: NextRequest) {
  try {
    // Get all data from database with proper typing
    const leads = leadQueries.getAll() as Lead[];
    const orders = orderQueries.getAll() as Order[];
    const customers = customerQueries.getAll() as Customer[];
    const invoices = invoiceQueries.getAll() as Invoice[];

    // Calculate lead statistics
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const interestedLeads = leads.filter(lead => lead.status === 'interested').length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const wantsCallLeads = leads.filter(lead => lead.wants_call).length;

    // Calculate order statistics
    const totalOrders = orders.length;
    const newOrders = orders.filter(order => order.status === 'new').length;
    const processingOrders = orders.filter(order => order.status === 'processing').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    // Calculate customer statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(customer => customer.status === 'active').length;
    const inactiveCustomers = customers.filter(customer => customer.status === 'inactive').length;
    const customersWithDomain = customers.filter(customer => customer.domain && customer.domain !== '').length;

    // Calculate revenue statistics
    const totalRevenue = orders.reduce((sum: number, order: Order) => {
      const monthlyRevenue = order.monthly_revenue || 0;
      const monthlyCommission = monthlyRevenue * 0.1; // 10% commission
      const yearlyCommission = monthlyCommission * 12;
      const yearlyFee = 180; // Annual fee
      return sum + yearlyCommission + yearlyFee;
    }, 0);

    const monthlyRevenue = totalRevenue / 12;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate invoice statistics
    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;

    // Calculate total invoice amount
    const totalInvoiceAmount = invoices.reduce((sum: number, invoice: Invoice) => {
      const taxAmount = invoice.amount * (invoice.tax_rate / 100);
      return sum + invoice.amount + taxAmount;
    }, 0);

    // Calculate growth rates (compared to previous period)
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const leadsThisMonth = leads.filter(lead => 
      new Date(lead.created_at) >= thisMonth
    ).length;

    const leadsLastMonth = leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= lastMonth && leadDate < thisMonth;
    }).length;

    const ordersThisMonth = orders.filter(order => 
      new Date(order.created_at) >= thisMonth
    ).length;

    const ordersLastMonth = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= lastMonth && orderDate < thisMonth;
    }).length;

    // Calculate growth percentages
    const leadsGrowth = leadsLastMonth > 0 ? 
      ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100 : 0;
    
    const ordersGrowth = ordersLastMonth > 0 ? 
      ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;

    // Calculate revenue growth
    const revenueThisMonth = orders.filter(order => 
      new Date(order.created_at) >= thisMonth
    ).reduce((sum: number, order: Order) => {
      const monthlyRevenue = order.monthly_revenue || 0;
      const monthlyCommission = monthlyRevenue * 0.1;
      const yearlyCommission = monthlyCommission * 12;
      const yearlyFee = 180;
      return sum + yearlyCommission + yearlyFee;
    }, 0);

    const revenueLastMonth = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= lastMonth && orderDate < thisMonth;
    }).reduce((sum: number, order: Order) => {
      const monthlyRevenue = order.monthly_revenue || 0;
      const monthlyCommission = monthlyRevenue * 0.1;
      const yearlyCommission = monthlyCommission * 12;
      const yearlyFee = 180;
      return sum + yearlyCommission + yearlyFee;
    }, 0);

    const revenueGrowth = revenueLastMonth > 0 ? 
      ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLeads = leads.filter(lead => 
      new Date(lead.created_at) >= sevenDaysAgo
    ).length;

    const recentOrders = orders.filter(order => 
      new Date(order.created_at) >= sevenDaysAgo
    ).length;

    const recentCustomers = customers.filter(customer => 
      new Date(customer.created_at) >= sevenDaysAgo
    ).length;

    // Return comprehensive statistics
    const stats = {
      // Lead statistics
      leads: {
        total: totalLeads,
        new: newLeads,
        interested: interestedLeads,
        converted: convertedLeads,
        wantsCall: wantsCallLeads,
        growth: leadsGrowth
      },
      
      // Order statistics
      orders: {
        total: totalOrders,
        new: newOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        growth: ordersGrowth
      },
      
      // Customer statistics
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        withDomain: customersWithDomain
      },
      
      // Revenue statistics
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        monthly: Math.round(monthlyRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        growth: revenueGrowth
      },
      
      // Invoice statistics
      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        paid: paidInvoices,
        overdue: overdueInvoices,
        totalAmount: Math.round(totalInvoiceAmount * 100) / 100
      },
      
      // Conversion and performance
      performance: {
        conversionRate: Math.round(conversionRate * 100) / 100,
        recentActivity: {
          leads: recentLeads,
          orders: recentOrders,
          customers: recentCustomers
        }
      },
      
      // System health
      system: {
        databaseConnected: true,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export protected handler
export const GET = getDashboardStats;
