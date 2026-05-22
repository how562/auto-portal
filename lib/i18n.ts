export {
  createTranslator,
  translations,
  type TranslationKey,
  type Translator,
} from "./i18n/translations";
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./i18n/types";

import { createTranslator } from "./i18n/translations";
import { DEFAULT_LOCALE, type Locale } from "./i18n/types";

/** Server-safe translate helper when locale is known. */
export function t(
  locale: Locale,
  key: Parameters<ReturnType<typeof createTranslator>>[0],
  fallback?: string,
  params?: Record<string, string | number>,
): string {
  return createTranslator(locale)(key, fallback, params);
}

export { DEFAULT_LOCALE as currentLanguageDefault };
