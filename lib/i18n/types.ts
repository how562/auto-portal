export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "frontier-portal-locale";

export type { TranslationKey } from "./translations";
