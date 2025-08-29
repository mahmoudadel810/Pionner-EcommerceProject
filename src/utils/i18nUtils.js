import i18n from '../i18n/index';

/**
 * Get translated text for use in stores and other non-React contexts
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation is not found
 * @param {object} options - Translation options (interpolation, etc.)
 * @returns {string} Translated text
 */
export const getTranslation = (key, fallback = '', options = {}) => {
  try {
    const translation = i18n.t(key, options);
    // If translation returns the key itself, it means translation was not found
    return translation === key ? fallback : translation;
  } catch (error) {
    console.warn(`Translation error for key "${key}":`, error);
    return fallback;
  }
};

/**
 * Get current language code
 * @returns {string} Current language code (e.g., 'en', 'ar')
 */
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

/**
 * Check if current language is RTL
 * @returns {boolean} True if current language is RTL
 */
export const isRTL = () => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(getCurrentLanguage());
};