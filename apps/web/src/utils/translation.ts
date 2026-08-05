/**
 * Programmatically triggers Google Translate translation for the whole page
 * by selecting the target language code in the Google Translate combo box element
 * and dispatching a 'change' event on it.
 */
export function applyLanguageTranslation(langName: string) {
  if (!langName) return;

  const languageMap: Record<string, string> = {
    'english': 'en',
    'hindi': 'hi',
    'hinglish': 'hi', // Translate Hinglish requests to Hindi for UI text
    'marathi': 'mr',
    'tamil': 'ta',
    'telugu': 'te',
    'kannada': 'kn',
    'gujarati': 'gu',
    'bengali': 'bn',
    'punjabi': 'pa',
    'malayalam': 'ml',
    'auto detect': 'en'
  };

  const code = languageMap[langName.toLowerCase()] || 'en';

  const triggerChange = (el: HTMLSelectElement) => {
    el.value = code;
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  };

  // Look for the Google Translate dropdown element
  const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (selectEl) {
    triggerChange(selectEl);
  } else {
    // If Google Translate hasn't finished loading yet, poll periodically
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (retrySelect) {
        triggerChange(retrySelect);
        clearInterval(interval);
      }
      if (attempts >= 15) {
        clearInterval(interval);
      }
    }, 500);
  }
}
