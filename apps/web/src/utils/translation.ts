/**
 * Programmatically triggers Google Translate translation for the whole page
 * by selecting the target language code in the Google Translate combo box element
 * and dispatching a 'change' event on it.
 */

const LANGUAGE_MAP: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Hinglish': 'hi', // Maps to Hindi for Google Translate, AI will respond in Hinglish
  'Marathi': 'mr',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Kannada': 'kn',
  'Gujarati': 'gu',
  'Bengali': 'bn',
  'Punjabi': 'pa',
  'Malayalam': 'ml',
  'Auto Detect': 'en',
};

export function applyLanguageTranslation(langName: string) {
  if (!langName) return;
  try {
    localStorage.setItem('sarthi_lang_pref', langName);
  } catch (err) {
    console.warn('Failed to store language preference:', err);
  }

  const langCode = LANGUAGE_MAP[langName] || 'en';

  const triggerTranslate = () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      if (select.value !== langCode) {
        select.value = langCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  // Immediate attempt and delayed attempts to handle script loading latency
  triggerTranslate();
  setTimeout(triggerTranslate, 300);
  setTimeout(triggerTranslate, 1000);
  setTimeout(triggerTranslate, 2500);
}

