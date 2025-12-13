'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useConsent } from './ConsentProvider'
import { sendPageView } from '@/lib/gtag'

export default function GA4Pageview() {
  const pathname = usePathname()
  const { hasConsent } = useConsent()

  useEffect(() => {
    // Nur Page View senden wenn Analytics erlaubt
    if (hasConsent('analytics')) {
      const pageTitle = document.title || 'Gastro CMS'
      sendPageView(pathname, pageTitle)
    }
  }, [pathname, hasConsent])

  return null // Diese Komponente rendert nichts
}
