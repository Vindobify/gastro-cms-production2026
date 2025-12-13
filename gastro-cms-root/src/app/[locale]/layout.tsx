import React from 'react'
import type { Metadata } from 'next'
import { I18nProvider } from '@/contexts/I18nContext'
import { messages, type Locale, defaultLocale } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'en' 
      ? 'Gastro CMS 3.0 - Only 10% Commission Instead of up to 30%'
      : 'Gastro CMS Österreich - Nur 10% Provision statt 30%',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const validLocale = (locale === 'de' || locale === 'en') ? (locale as Locale) : defaultLocale
  const messageLoader = messages[validLocale]
  
  if (!messageLoader || typeof messageLoader !== 'function') {
    console.error(`Invalid locale or message loader: ${locale}, validLocale: ${validLocale}`)
    // Fallback zu default locale
    const defaultLoader = messages[defaultLocale]
    const localeMessages = defaultLoader ? await defaultLoader() : {}
    return (
      <I18nProvider locale={defaultLocale} messages={localeMessages}>
        {children}
      </I18nProvider>
    )
  }
  
  const localeMessages = await messageLoader()
  
  return (
    <I18nProvider locale={validLocale} messages={localeMessages}>
      {children}
    </I18nProvider>
  )
}

