import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

// Default settings
const defaultSettings = {
  // General Settings
  companyName: 'Gastro CMS 3.0',
  companyEmail: 'info@gastro-cms.com',
  companyPhone: '+49 123 456789',
  companyAddress: 'Musterstraße 123, 12345 Musterstadt',
  
  // Email Settings
  smtpHost: 'smtp.brevo.com',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  
  // System Settings
  timezone: 'Europe/Berlin',
  dateFormat: 'DD.MM.YYYY',
  currency: 'EUR',
  language: 'de',
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: true,
  orderNotifications: true,
  leadNotifications: true,
  
  // Security Settings
  sessionTimeout: '30',
  requirePasswordChange: false,
  twoFactorAuth: false,
  
  // Backup Settings
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetention: '30'
};

// Helper function to read settings
function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error reading settings:', error);
    return defaultSettings;
  }
}

// Helper function to write settings
function writeSettings(settings: any) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(settingsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

async function getSettings() {
  try {
    const settings = readSettings();
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

async function updateSettings(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.companyName || !data.companyEmail) {
      return NextResponse.json(
        { success: false, error: 'Company name and email are required' },
        { status: 400 }
      );
    }
    
    // Merge with existing settings
    const currentSettings = readSettings();
    const updatedSettings = { ...currentSettings, ...data };
    
    // Save settings
    const success = writeSettings(updatedSettings);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to save settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

async function resetSettings(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Reset to default settings
    const success = writeSettings(defaultSettings);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings reset to default values',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = getSettings;
export const PUT = updateSettings;
export const POST = resetSettings;
