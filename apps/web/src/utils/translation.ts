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

const LANG_CODE_MAP: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Hinglish': 'hi',
  'Bengali': 'bn',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Marathi': 'mr',
  'Kannada': 'kn',
  'Gujarati': 'gu',
  'Punjabi': 'pa',
  'Malayalam': 'ml',
};

export function applyLanguageTranslation(langName: string, forceReapply: boolean = false) {
  if (!langName) return;
  try {
    localStorage.setItem('sarthi_lang_pref', langName);
    window.dispatchEvent(new CustomEvent('sarthi-language-change', { detail: { language: langName } }));
  } catch (err) {
    console.warn('Failed to store language preference:', err);
  }

  const targetCode = LANG_CODE_MAP[langName] || 'en';

  const triggerGoogleTranslateEngine = () => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (!combo) return;

    if (targetCode === 'en') {
      if (combo.value !== 'en') {
        combo.value = 'en';
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    // Force re-scan of newly mounted React DOM nodes when switching tabs
    if (forceReapply || combo.value === targetCode) {
      combo.value = 'en';
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        const reCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (reCombo) {
          reCombo.value = targetCode;
          reCombo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 40);
    } else {
      combo.value = targetCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  triggerGoogleTranslateEngine();
  setTimeout(triggerGoogleTranslateEngine, 250);
  setTimeout(triggerGoogleTranslateEngine, 700);
}




