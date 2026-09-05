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

let isScriptLoading = false;

function loadGoogleTranslateScript(callback: () => void) {
  if ((window as any).google?.translate?.TranslateElement) {
    callback();
    return;
  }

  (window as any).googleTranslateElementInit = function () {
    try {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,bn,ta,te,mr,kn,gu,pa,ml',
        autoDisplay: false
      }, 'google_translate_element');
    } catch (err) {
      console.warn('Google Translate initialization warning:', err);
    }
    callback();
  };

  if (!isScriptLoading) {
    isScriptLoading = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }
}

export function applyLanguageTranslation(langName: string, forceReapply: boolean = false) {
  const selectedLang = langName || 'English';
  const targetCode = LANG_CODE_MAP[selectedLang] || 'en';

  try {
    localStorage.setItem('sarthi_lang_pref', selectedLang);

    if (targetCode === 'en') {
      document.documentElement.setAttribute('translate', 'no');
      document.documentElement.classList.add('notranslate');
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (window.location.hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
      
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo && combo.value !== 'en') {
        combo.value = 'en';
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      window.dispatchEvent(new CustomEvent('sarthi-language-change', { detail: { language: 'English' } }));
      return;
    }

    // Regional language selected by user -> Enable translation and load Google Translate script on demand
    document.documentElement.removeAttribute('translate');
    document.documentElement.classList.remove('notranslate');
    document.cookie = `googtrans=/en/${targetCode}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=/en/${targetCode}; path=/; domain=${window.location.hostname};`;
    }

    loadGoogleTranslateScript(() => {
      const triggerEngine = () => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          combo.value = targetCode;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      triggerEngine();
      setTimeout(triggerEngine, 150);
      setTimeout(triggerEngine, 400);
    });

    window.dispatchEvent(new CustomEvent('sarthi-language-change', { detail: { language: selectedLang } }));
  } catch (err) {
    console.warn('Failed to store language preference:', err);
  }
}




