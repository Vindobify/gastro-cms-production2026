'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useState } from 'react'
import { getCookieConsent } from './CookieBanner'

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const check = () => {
      const consent = getCookieConsent()
      setEnabled(consent?.analytics === true)
    }
    check()
    window.addEventListener('cookie-consent-updated', check)
    return () => window.removeEventListener('cookie-consent-updated', check)
  }, [])

  if (!enabled || !gaId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
