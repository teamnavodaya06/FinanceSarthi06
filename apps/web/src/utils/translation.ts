/**
 * Manages FinanceSarthi native language preference state across the application
 * without relying on Google Translate DOM manipulation artifacts.
 */

export const SUPPORTED_LANGUAGES = [
  { id: 'English', native: 'English', label: 'English' },
  { id: 'Hindi', native: 'हिंदी', label: 'Hindi' },
  { id: 'Hinglish', native: 'Hinglish', label: 'Hindi + English' },
  { id: 'Bengali', native: 'বাংলা', label: 'Bengali' },
  { id: 'Tamil', native: 'தமிழ்', label: 'Tamil' },
  { id: 'Telugu', native: 'తెలుగు', label: 'Telugu' },
  { id: 'Marathi', native: 'मराठी', label: 'Marathi' },
  { id: 'Kannada', native: 'ಕನ್ನಡ', label: 'Kannada' },
  { id: 'Gujarati', native: 'ગુજરાતી', label: 'Gujarati' },
  { id: 'Punjabi', native: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
  { id: 'Malayalam', native: 'മലയാളം', label: 'Malayalam' },
];

export function applyLanguageTranslation(langName: string) {
  if (!langName) return;
  try {
    localStorage.setItem('sarthi_lang_pref', langName);
    window.dispatchEvent(new CustomEvent('sarthi-language-change', { detail: { language: langName } }));
  } catch (err) {
    console.warn('Failed to store language preference:', err);
  }
}


