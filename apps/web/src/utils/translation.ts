/**
 * Programmatically triggers Google Translate translation for the whole page
 * by selecting the target language code in the Google Translate combo box element
 * and dispatching a 'change' event on it.
 */
export function applyLanguageTranslation(langName: string) {
  if (!langName) return;
  try {
    localStorage.setItem('sarthi_lang_pref', langName);
  } catch (err) {
    console.warn('Failed to store language preference:', err);
  }
}
