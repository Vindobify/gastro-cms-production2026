'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

type Messages = Record<string, any>;

interface I18nContextType {
  locale: Locale;
  messages: Messages;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslations(namespace: string) {
  const { messages, t } = useI18n();
  const nsMessages = messages[namespace] || {};

  return (key: string): string => {
    const fullKey = `${namespace}.${key}`;
    const value = nsMessages[key];
    return typeof value === 'string' ? value : t(fullKey);
  };
}

