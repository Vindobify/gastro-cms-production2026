import type { Locale } from './i18n';
import { messages } from './i18n';

export async function getTranslations(locale: Locale, namespace: string) {
  const localeMessages: any = await messages[locale]();
  const ns: any = localeMessages[namespace] || {};
  return (key: string) => ns[key] || key;
}

