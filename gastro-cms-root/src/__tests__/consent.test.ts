/**
 * Unit Tests für Consent-Management
 * Testet Cookie-Funktionalität und DSGVO-Compliance
 */

import { 
  setConsentCookie, 
  getConsentCookie, 
  hasConsent, 
  saveConsent,
  DEFAULT_CONSENT,
  CONSENT_VERSION 
} from '@/lib/consent'

// Mock für DOM-Umgebung
const mockDocument = {
  cookie: '',
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
  })),
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

describe('Consent Management', () => {
  beforeEach(() => {
    mockDocument.cookie = ''
  })

  describe('Cookie-Funktionen', () => {
    test('sollte Consent-Cookie setzen', () => {
      const testConsent = {
        v: '1.0',
        t: '2024-01-01T00:00:00Z',
        categories: {
          essential: true,
          analytics: false,
          marketing: false,
        },
      }

      setConsentCookie(testConsent)
      
      expect(mockDocument.cookie).toContain('cc_prefs=')
      expect(mockDocument.cookie).toContain('Max-Age=15552000') // 180 Tage
      expect(mockDocument.cookie).toContain('Path=/')
      expect(mockDocument.cookie).toContain('SameSite=Lax')
    })

    test('sollte Consent-Cookie lesen', () => {
      const testConsent = {
        v: '1.0',
        t: '2024-01-01T00:00:00Z',
        categories: {
          essential: true,
          analytics: true,
          marketing: false,
        },
      }

      // Cookie simulieren
      mockDocument.cookie = `cc_prefs=${encodeURIComponent(JSON.stringify(testConsent))}; Max-Age=15552000; Path=/; SameSite=Lax`
      
      const result = getConsentCookie()
      expect(result).toEqual(testConsent)
    })

    test('sollte null zurückgeben bei ungültigem Cookie', () => {
      mockDocument.cookie = 'cc_prefs=invalid-json'
      
      const result = getConsentCookie()
      expect(result).toBeNull()
    })
  })

  describe('Consent-Status', () => {
    test('sollte Consent-Status korrekt prüfen', () => {
      const testConsent = {
        v: '1.0',
        t: '2024-01-01T00:00:00Z',
        categories: {
          essential: true,
          analytics: true,
          marketing: false,
        },
      }

      mockDocument.cookie = `cc_prefs=${encodeURIComponent(JSON.stringify(testConsent))}`
      
      expect(hasConsent('essential')).toBe(true)
      expect(hasConsent('analytics')).toBe(true)
      expect(hasConsent('marketing')).toBe(false)
    })

    test('sollte false zurückgeben wenn kein Cookie vorhanden', () => {
      expect(hasConsent('analytics')).toBe(false)
    })
  })

  describe('Consent speichern', () => {
    test('sollte neuen Consent speichern', () => {
      const preferences = {
        essential: true,
        analytics: true,
        marketing: true,
      }

      const result = saveConsent(preferences)
      
      expect(result.v).toBe(CONSENT_VERSION)
      expect(result.categories).toEqual(preferences)
      expect(mockDocument.cookie).toContain('cc_prefs=')
    })
  })

  describe('Default-Consent', () => {
    test('sollte korrekte Default-Werte haben', () => {
      expect(DEFAULT_CONSENT.categories.essential).toBe(true)
      expect(DEFAULT_CONSENT.categories.analytics).toBe(false)
      expect(DEFAULT_CONSENT.categories.marketing).toBe(false)
      expect(DEFAULT_CONSENT.v).toBe(CONSENT_VERSION)
    })
  })
})

// Playwright Test Snippet für E2E-Tests
export const playwrightConsentTests = `
// Playwright E2E Tests für Cookie-Banner
import { test, expect } from '@playwright/test'

test.describe('Cookie Banner E2E Tests', () => {
  test('sollte Cookie-Banner bei erstem Besuch anzeigen', async ({ page }) => {
    await page.goto('/')
    
    // Banner sollte sichtbar sein
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // GA4-Skript sollte NICHT geladen sein
    const ga4Script = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(ga4Script).not.toBeAttached()
  })

  test('sollte GA4 nach "Alle akzeptieren" laden', async ({ page }) => {
    await page.goto('/')
    
    // "Alle akzeptieren" klicken
    await page.click('text=Alle akzeptieren')
    
    // Banner sollte verschwinden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // GA4-Skript sollte geladen werden
    await page.waitForSelector('script[src*="googletagmanager.com/gtag/js"]')
    
    // Re-Open Button sollte erscheinen
    await expect(page.locator('text=Cookie-Einstellungen')).toBeVisible()
  })

  test('sollte Consent bei "Alle ablehnen" verweigern', async ({ page }) => {
    await page.goto('/')
    
    // "Alle ablehnen" klicken
    await page.click('text=Alle ablehnen')
    
    // Banner sollte verschwinden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // GA4-Skript sollte NICHT geladen sein
    const ga4Script = page.locator('script[src*="googletagmanager.com/gtag/js"]')
    await expect(ga4Script).not.toBeAttached()
  })

  test('sollte Re-Open Button funktionieren', async ({ page }) => {
    await page.goto('/')
    
    // Erst akzeptieren
    await page.click('text=Alle akzeptieren')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // Re-Open Button klicken
    await page.click('text=Cookie-Einstellungen')
    
    // Banner sollte wieder erscheinen
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('sollte Page-View nur bei erlaubtem Analytics senden', async ({ page }) => {
    // Analytics erlauben
    await page.goto('/')
    await page.click('text=Alle akzeptieren')
    
    // Zu anderer Seite navigieren
    await page.goto('/preise')
    
    // GA4 Page-View Event sollte gesendet werden
    await page.waitForFunction(() => {
      return window.dataLayer?.some((item: any) => 
        item[0] === 'event' && item[1] === 'page_view'
      )
    })
  })

  test('sollte Accessibility-Anforderungen erfüllen', async ({ page }) => {
    await page.goto('/')
    
    // Banner sollte fokussierbar sein
    await page.keyboard.press('Tab')
    await expect(page.locator('[role="dialog"]')).toBeFocused()
    
    // Escape sollte Banner schließen
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // ARIA-Attribute sollten korrekt sein
    const banner = page.locator('[role="dialog"]')
    await expect(banner).toHaveAttribute('aria-modal', 'true')
    await expect(banner).toHaveAttribute('aria-labelledby')
  })
})
`
