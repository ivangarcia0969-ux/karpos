import esCO from './locales/es-CO.json';
import enUS from './locales/en-US.json';

export const SUPPORTED_LOCALES = ['es-CO', 'es-MX', 'es-ES', 'es-AR', 'es-CL', 'en-US', 'pt-BR'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es-CO';

export const messages: Record<Locale, Record<string, string>> = {
  'es-CO': esCO as Record<string, string>,
  'es-AR': esCO as Record<string, string>,
  'es-CL': esCO as Record<string, string>,
  'es-MX': esCO as Record<string, string>,
  'es-ES': esCO as Record<string, string>,
  'en-US': enUS as Record<string, string>,
  'pt-BR': enUS as Record<string, string>,
};

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = messages[locale] ?? messages[DEFAULT_LOCALE];
  let value = dict[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}
