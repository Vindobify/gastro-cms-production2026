import { NextRequest, NextResponse } from 'next/server';
import { leadQueries } from '@/lib/database';
import { sendLeadEmail, LeadFormData } from '@/lib/emailService';

async function getLeads() {
  try {
    const leads = leadQueries.getAll();
    const stats = leadQueries.getStats();
    
    return NextResponse.json({
      success: true,
      leads,
      stats
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

async function createLead(request: NextRequest) {
  try {
    const data: LeadFormData = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.restaurant_name || !data.contactEmail || !data.monthlyRevenue) {
      return NextResponse.json(
        { success: false, error: 'Restaurant-Name, E-Mail und monatlicher Umsatz sind erforderlich' },
        { status: 400 }
      );
    }

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Berechnungen durchführen
    const currentCommission = data.currentCommission || 15; // Standard 15%
    const gastroCommission = 8; // Gastro CMS Kommission
    
    const currentCost = data.monthlyRevenue * (currentCommission / 100);
    const gastroCost = data.monthlyRevenue * (gastroCommission / 100);
    const savings = currentCost - gastroCost;
    const savingsPercentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
    const yearlySavings = savings * 12;

    // Lead in Datenbank speichern
    const leadData = {
      restaurant_name: data.restaurant_name,
      contact_email: data.contactEmail,
      phone: data.phone || null,
      monthly_revenue: data.monthlyRevenue,
      current_commission: currentCommission,
      current_cost: currentCost,
      gastro_cost: gastroCost,
      savings: savings,
      savings_percentage: savingsPercentage,
      yearly_savings: yearlySavings,
      wants_call: false,
      status: 'new',
      call_notes: null
    };
    
    const result = leadQueries.create(leadData);
    
    // E-Mail senden
    const emailSent = await sendLeadEmail(data);
    
    if (!emailSent) {
      console.warn('Lead created but email failed to send');
    }
    
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Lead erfolgreich gesendet! Wir melden uns schnellstmöglich bei dir.'
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getLeads;
export const POST = createLead; // Öffentlich zugänglich für Lead-Formular
