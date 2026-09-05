import { useState, useEffect } from 'react';

export type LanguageId = 
  | 'English' 
  | 'Hindi' 
  | 'Hinglish' 
  | 'Bengali' 
  | 'Tamil' 
  | 'Telugu' 
  | 'Marathi' 
  | 'Kannada' 
  | 'Gujarati' 
  | 'Punjabi' 
  | 'Malayalam';

export const TRANSLATIONS: Record<LanguageId, Record<string, string>> = {
  English: {
    // Nav & Sidebar
    dashboard: 'Dashboard',
    action_center: 'AI Action Center',
    salary_planner: 'Salary Planner',
    goals: 'Goals Workspace',
    expenses: 'Expense Tracker',
    budgets: 'Adaptive AI Budget',
    chat: 'Sarthi AI Companion',
    settings: 'Settings',
    overview: 'Overview',
    money: 'Money Management',
    ai_tools: 'AI Sarthi Tools',
    
    // Header
    search_placeholder: 'Search goals, transactions, calculators...',
    ask_sarthi: 'Ask Sarthi',
    tier: 'Tier:',
    health_score: 'Score:',
    
    // Dashboard
    good_evening: 'Personalized Financial Operating System',
    net_worth: 'Estimated Net Worth',
    monthly_income: 'Monthly Income',
    monthly_expenses: 'Monthly Expenses',
    total_savings: 'Total Savings',
    financial_health_score: 'Financial Health Score',
    quick_actions: 'Quick AI Actions',
    recent_transactions: 'Recent Transactions',
    ai_recommendations: 'Sarthi Intelligence Insights',
    
    // Actions
    add_expense: 'Add Expense',
    save_changes: 'Save Changes',
    export_data: 'Export Data',
    danger_zone: 'Danger Zone',
    select_language: 'Select Language',
    profile_details: 'Personal Profile Details',
    financial_preferences: 'Financial & AI Preferences',
    security: 'Security & Encryption',
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    action_center: 'एआई एक्शन सेंटर',
    salary_planner: 'सैलरी प्लानर',
    goals: 'लक्ष्य प्रबंधन',
    expenses: 'खर्च ट्रैकर',
    budgets: 'स्मार्ट एआई बजट',
    chat: 'सारथी एआई साथी',
    settings: 'सेटिंग्स',
    overview: 'ओवरव्यू',
    money: 'धन प्रबंधन',
    ai_tools: 'एआई सारथी टूल्स',
    
    search_placeholder: 'लक्ष्य, लेनदेन, कैलकुलेटर खोजें...',
    ask_sarthi: 'सारथी से पूछें',
    tier: 'शहर श्रेणी:',
    health_score: 'स्कोर:',
    
    good_evening: 'व्यक्तिगत वित्तीय ऑपरेटिंग सिस्टम',
    net_worth: 'कुल संपत्ति (Net Worth)',
    monthly_income: 'मासिक आय',
    monthly_expenses: 'मासिक खर्च',
    total_savings: 'कुल बचत',
    financial_health_score: 'वित्तीय स्वास्थ्य स्कोर',
    quick_actions: 'त्वरित एआई कार्य',
    recent_transactions: 'हाल के लेन-देन',
    ai_recommendations: 'सारथी एआई सुझाव',
    
    add_expense: 'खर्च जोड़ें',
    save_changes: 'बदलाव सहेजें',
    export_data: 'डेटा निर्यात करें',
    danger_zone: 'खतरा क्षेत्र',
    select_language: 'भाषा चुनें',
    profile_details: 'व्यक्तिगत प्रोफ़ाइल विवरण',
    financial_preferences: 'वित्तीय और एआई प्राथमिकताएं',
    security: 'सुरक्षा और एन्क्रिप्शन',
  },
  Hinglish: {
    dashboard: 'Dashboard',
    action_center: 'AI Action Center',
    salary_planner: 'Salary Planner',
    goals: 'Financial Goals',
    expenses: 'Expense Tracker',
    budgets: 'Smart AI Budget',
    chat: 'Sarthi AI Companion',
    settings: 'Settings',
    overview: 'Overview',
    money: 'Paisa Management',
    ai_tools: 'AI Sarthi Tools',
    
    search_placeholder: 'Search goals, transactions, calculators...',
    ask_sarthi: 'Sarthi Se Poochhein',
    tier: 'City Tier:',
    health_score: 'Score:',
    
    good_evening: 'Aapka Personal Financial Assistant',
    net_worth: 'Aapki Net Worth',
    monthly_income: 'Mahine Ki Kamai',
    monthly_expenses: 'Mahine Ka Kharcha',
    total_savings: 'Kul Bachat',
    financial_health_score: 'Financial Health Score',
    quick_actions: 'Quick AI Actions',
    recent_transactions: 'Haal Ke Kharche',
    ai_recommendations: 'Sarthi AI Insights',
    
    add_expense: 'Naya Kharcha Jodein',
    save_changes: 'Save Karein',
    export_data: 'Data Export Karein',
    danger_zone: 'Danger Zone',
    select_language: 'Bhasha Chunein',
    profile_details: 'Profile Details',
    financial_preferences: 'Financial & AI Preferences',
    security: 'Security & Encryption',
  },
  Bengali: {
    dashboard: 'ড্যাশবোর্ড',
    action_center: 'এআই অ্যাকশন সেন্টার',
    salary_planner: 'বেতন পরিকল্পনাকারী',
    goals: 'লক্ষ্যসমূহ',
    expenses: 'ব্যয় ট্র্যাকার',
    budgets: 'স্মার্ট এআই বাজেট',
    chat: 'সারথী এআই সহযোগী',
    settings: 'সেটিংস',
    overview: 'সংক্ষিপ্ত বিবরণ',
    money: 'অর্থ ব্যবস্থাপনা',
    ai_tools: 'এআই সারথী সরঞ্জাম',
    
    search_placeholder: 'অনুসন্ধান করুন...',
    ask_sarthi: 'সারথীকে জিজ্ঞাসা করুন',
    tier: 'শহরের স্তর:',
    health_score: 'স্কোর:',
    
    good_evening: 'ব্যক্তিগত আর্থিক অপারেটিং সিস্টেম',
    net_worth: 'মোট সম্পদ',
    monthly_income: 'মাসিক আয়',
    monthly_expenses: 'মাসিক খরচ',
    total_savings: 'মোট সঞ্চয়',
    financial_health_score: 'আর্থিক স্বাস্থ্য স্কোর',
    quick_actions: 'দ্রুত এআই পদক্ষেপ',
    recent_transactions: 'সাম্প্রতিক লেনদেন',
    ai_recommendations: 'সারথী এআই পরামর্শ',
    
    add_expense: 'ব্যয় যোগ করুন',
    save_changes: 'সংরক্ষণ করুন',
    export_data: 'ডেটা এক্সপোর্ট করুন',
    danger_zone: 'বিপদজনক অঞ্চল',
    select_language: 'ভাষা নির্বাচন করুন',
    profile_details: 'প্রোফাইল বিবরণ',
    financial_preferences: 'আর্থিক পছন্দসমূহ',
    security: 'নিরাপত্তা ও এনক্রিপশন',
  },
  Tamil: {
    dashboard: 'டாஷ்போர்டு',
    action_center: 'AI செயல் மையம்',
    salary_planner: 'சம்பள திட்டமிடுபவர்',
    goals: 'இலக்குகள்',
    expenses: 'செலவு கண்காணிப்பாளர்',
    budgets: 'AI பட்ஜெட்',
    chat: 'சாரதி AI',
    settings: 'அமைப்புகள்',
    overview: 'மேலோட்டம்',
    money: 'பண மேலாண்மை',
    ai_tools: 'AI கருவிகள்',
    
    search_placeholder: 'தேடுங்கள்...',
    ask_sarthi: 'சாரதியிடம் கேளுங்கள்',
    tier: 'நகரம்:',
    health_score: 'மதிப்பெண்:',
    
    good_evening: 'தனிப்பட்ட நிதி அமைப்பு',
    net_worth: 'மொத்த மதிப்பு',
    monthly_income: 'மாத வருமானம்',
    monthly_expenses: 'மாத செலவு',
    total_savings: 'மொத்த சேமிப்பு',
    financial_health_score: 'நிதி ஆரோக்கிய மதிப்பெண்',
    quick_actions: 'வேகமான AI செயல்கள்',
    recent_transactions: 'சமீபத்திய பரிவர்த்தனைகள்',
    ai_recommendations: 'சாரதி AI பரிந்துரைகள்',
    
    add_expense: 'செலவைச் சேர்',
    save_changes: 'சேமிக்க',
    export_data: 'தரவை ஏற்றுமதி செய்',
    danger_zone: 'ஆபத்து பகுதி',
    select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    profile_details: 'சுயவிவர விவரங்கள்',
    financial_preferences: 'நிதி விருப்பங்கள்',
    security: 'பாதுகாப்பு',
  },
  Telugu: {
    dashboard: 'డాష్‌బోర్డ్',
    action_center: 'AI యాక్షన్ సెంటర్',
    salary_planner: 'జీతం ప్లానర్',
    goals: 'లక్ష్యాలు',
    expenses: 'ఖర్చుల ట్రాకర్',
    budgets: 'స్మార్ట్ AI బడ్జెట్',
    chat: 'సారథి AI',
    settings: 'సెట్టింగ్‌లు',
    overview: 'ఓవర్‌వ్యూ',
    money: 'ధన నిర్వహణ',
    ai_tools: 'AI టూల్స్',
    
    search_placeholder: 'శోధించండి...',
    ask_sarthi: 'సారథిని అడగండి',
    tier: 'నగరం:',
    health_score: 'స్కోర్:',
    
    good_evening: 'వ్యక్తిగత ఆర్థిక వ్యవస్థ',
    net_worth: 'మొత్తం నికర విలువ',
    monthly_income: 'నెలవారీ రాబడి',
    monthly_expenses: 'నెలవారీ ఖర్చులు',
    total_savings: 'మొత్తం పొదుపు',
    financial_health_score: 'ఆర్థిక ఆరోగ్య స్కోర్',
    quick_actions: 'త్వరిత AI చర్యలు',
    recent_transactions: 'ఇటీవలి లావాదేవీలు',
    ai_recommendations: 'సారథి AI సూచనలు',
    
    add_expense: 'ఖర్చు జోడించండి',
    save_changes: 'సేవ్ చేయండి',
    export_data: 'డేటాను ఎగుమతి చేయండి',
    danger_zone: 'ప్రమాదకర ప్రాంతం',
    select_language: 'భాషను ఎంచుకోండి',
    profile_details: 'ప్రొఫైల్ వివరాలు',
    financial_preferences: 'ఆర్థిక ప్రాధాన్యతలు',
    security: 'భద్రత',
  },
  Marathi: {
    dashboard: 'डॅशबोर्ड',
    action_center: 'एआय ॲक्शन सेंटर',
    salary_planner: 'पगार नियोजक',
    goals: 'ध्येय',
    expenses: 'खर्च ट्रॅकर',
    budgets: 'स्मार्ट एआय बजेट',
    chat: 'सारथी एआय',
    settings: 'सेटिंग्ज',
    overview: 'आढावा',
    money: 'पैसा व्यवस्थापन',
    ai_tools: 'एआय साधने',
    
    search_placeholder: 'शोधा...',
    ask_sarthi: 'सारथीला विचारा',
    tier: 'शहर श्रेणी:',
    health_score: 'स्कोअर:',
    
    good_evening: 'वैयक्तिक आर्थिक प्रणाली',
    net_worth: 'एकूण संपत्ती',
    monthly_income: 'मासिक उत्पन्न',
    monthly_expenses: 'मासिक खर्च',
    total_savings: 'एकूण बचत',
    financial_health_score: 'आर्थिक आरोग्य स्कोअर',
    quick_actions: 'जलद एआय कृती',
    recent_transactions: 'अलीकडील व्यवहार',
    ai_recommendations: 'सारथी एआय सल्ला',
    
    add_expense: 'खर्च जोडा',
    save_changes: 'जतन करा',
    export_data: 'डेटा निर्यात करा',
    danger_zone: 'धोकादायक क्षेत्र',
    select_language: 'भाषा निवडा',
    profile_details: 'प्रोफाइल तपशील',
    financial_preferences: 'आर्थिक प्राधान्ये',
    security: 'सुरक्षा',
  },
  Kannada: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    action_center: 'AI ಆಕ್ಷನ್ ಸೆಂಟರ್',
    salary_planner: 'ಸಂಬಳ ಯೋಜನೆ',
    goals: 'ಗುರಿಗಳು',
    expenses: 'ಖರ್ಚುಗಳ ಟ್ರ್ಯಾಕರ್',
    budgets: 'AI ಬಜೆಟ್',
    chat: 'ಸಾರಥಿ AI',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    overview: 'ಅವಲೋಕನ',
    money: 'ಹಣ ನಿರ್ವಹಣೆ',
    ai_tools: 'AI ಉಪಕರಣಗಳು',
    
    search_placeholder: 'ಹುಡುಕಿ...',
    ask_sarthi: 'ಸಾರಥಿಯನ್ನು ಕೇಳಿ',
    tier: 'ನಗರ:',
    health_score: 'ಸ್ಕೋರ್:',
    
    good_evening: 'ವ್ಯಕ್ತಿಗತ ಹಣಕಾಸು ವ್ಯವಸ್ಥೆ',
    net_worth: 'ಒಟ್ಟು ಮೌಲ್ಯ',
    monthly_income: 'ಮಾಸಿಕ ಆದಾಯ',
    monthly_expenses: 'ಮಾಸಿಕ ಖರ್ಚು',
    total_savings: 'ಒಟ್ಟು ಉಳಿತಾಯ',
    financial_health_score: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್',
    quick_actions: 'ವೇಗದ AI ಕ್ರಿಯೆಗಳು',
    recent_transactions: 'ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು',
    ai_recommendations: 'ಸಾರಥಿ AI ಸಲಹೆಗಳು',
    
    add_expense: 'ಖರ್ಚು ಸೇರಿಸಿ',
    save_changes: 'ಉಳಿಸಿ',
    export_data: 'ಡೇಟಾ ರಫ್ತು ಮಾಡಿ',
    danger_zone: 'ಅಪಾಯಕಾರಿ ವಲಯ',
    select_language: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    profile_details: 'ಪ್ರೊಫೈಲ್ ವಿವರಗಳು',
    financial_preferences: 'ಹಣಕಾಸಿನ ಆದ್ಯತೆಗಳು',
    security: 'ಸುರಕ್ಷತೆ',
  },
  Gujarati: {
    dashboard: 'ડેશબોર્ડ',
    action_center: 'AI એક્શન સેન્ટર',
    salary_planner: 'પગાર પ્લાનર',
    goals: 'લક્ષ્યો',
    expenses: 'ખર્ચ ટ્રેકર',
    budgets: 'સ્માર્ટ AI બજેટ',
    chat: 'સારથિ AI',
    settings: 'સેટિંગ્સ',
    overview: 'ઝડપી વિહંગાવલોકન',
    money: 'નાણાં વ્યવસ્થાપન',
    ai_tools: 'AI સાધનો',
    
    search_placeholder: 'શોધો...',
    ask_sarthi: 'સારથિને પૂછો',
    tier: 'શહેર:',
    health_score: 'સ્કોર:',
    
    good_evening: 'વ્યક્તિગત નાણાકીય સિસ્ટમ',
    net_worth: 'કુલ સંપત્તિ',
    monthly_income: 'માસિક આવક',
    monthly_expenses: 'માસિક ખર્ચ',
    total_savings: 'કુલ બચત',
    financial_health_score: 'નાણાકીય સ્વાસ્થ્ય સ્કોર',
    quick_actions: 'ઝડપી AI કાર્યો',
    recent_transactions: 'તાજેતરના વ્યવહારો',
    ai_recommendations: 'સારથિ AI સલાહ',
    
    add_expense: 'ખર્ચ ઉમેરો',
    save_changes: 'સાચવો',
    export_data: 'ડેટા નિકાસ કરો',
    danger_zone: 'ખતરાનો વિસ્તાર',
    select_language: 'ભાષા પસંદ કરો',
    profile_details: 'પ્રોફાઇલ વિગતો',
    financial_preferences: 'નાણાકીય પ્રાથમિકતાઓ',
    security: 'સુરક્ષા',
  },
  Punjabi: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    action_center: 'AI ਐਕਸ਼ਨ ਸੈਂਟਰ',
    salary_planner: 'ਤਨਖਾਹ ਪਲਾਨਰ',
    goals: 'ਟੀਚੇ',
    expenses: 'ਖਰਚਾ ਟ੍ਰੈਕਰ',
    budgets: 'AI ਬਜਟ',
    chat: 'ਸਾਰਥੀ AI',
    settings: 'ਸੈਟਿੰਗਾਂ',
    overview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
    money: 'ਪੈਸੇ ਦਾ ਪ੍ਰਬੰਧਨ',
    ai_tools: 'AI ਟੂਲਜ਼',
    
    search_placeholder: 'ਖੋਜੋ...',
    ask_sarthi: 'ਸਾਰਥੀ ਨੂੰ ਪੁੱਛੋ',
    tier: 'ਸ਼ਹਿਰ:',
    health_score: 'ਸਕੋਰ:',
    
    good_evening: 'ਨਿੱਜੀ ਵਿੱਤੀ ਪ੍ਰਣਾਲੀ',
    net_worth: 'ਕੁਲ ਸੰਪਤੀ',
    monthly_income: 'ਮਹੀਨਾਵਾਰ ਆਮਦਨ',
    monthly_expenses: 'ਮਹੀਨਾਵਾਰ ਖਰਚਾ',
    total_savings: 'ਕੁਲ ਬਚਤ',
    financial_health_score: 'ਵਿੱਤੀ ਸਿਹਤ ਸਕੋਰ',
    quick_actions: 'ਤੇਜ਼ AI ਕਾਰਵਾਈਆਂ',
    recent_transactions: 'ਹਾਲੀਆ ਲੈਣ-ਦੇਣ',
    ai_recommendations: 'ਸਾਰਥੀ AI ਸਲਾਹ',
    
    add_expense: 'ਖਰਚਾ ਜੋੜੋ',
    save_changes: 'ਸੰਭਾਲੋ',
    export_data: 'ਡੇਟਾ ਐਕਸਪੋਰਟ ਕਰੋ',
    danger_zone: 'ਖਤਰਨਾਕ ਖੇਤਰ',
    select_language: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    profile_details: 'ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ',
    financial_preferences: 'ਵਿੱਤੀ ਤਰਜੀਹਾਂ',
    security: 'ਸੁਰੱਖਿਆ',
  },
  Malayalam: {
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    action_center: 'AI ആക്ഷൻ സെന്റർ',
    salary_planner: 'ശമ്പള പ്ലാനർ',
    goals: 'ലക്ഷ്യങ്ങൾ',
    expenses: 'ചിലവ് ട്രാക്കർ',
    budgets: 'സ്മാർട്ട് AI ബജറ്റ്',
    chat: 'സാരഥി AI',
    settings: 'ക്രമീകരണങ്ങൾ',
    overview: 'അവലോകനം',
    money: 'ധനകാര്യ മാനേജ്‌മെന്റ്',
    ai_tools: 'AI ടൂളുകൾ',
    
    search_placeholder: 'തിരയുക...',
    ask_sarthi: 'സാരഥിയോട് ചോദിക്കുക',
    tier: 'നഗരം:',
    health_score: 'സ്‌കോർ:',
    
    good_evening: 'വ്യക്തിഗത സാമ്പത്തിക സിസ്റ്റം',
    net_worth: 'ആകെ ആസ്തി',
    monthly_income: 'പ്രതിമാസ വരുമാനം',
    monthly_expenses: 'പ്രതിമാസ ചിലവ്',
    total_savings: 'ആകെ സമ്പാദ്യം',
    financial_health_score: 'സാമ്പത്തിക ആരോഗ്യ സ്‌കോർ',
    quick_actions: 'വേഗത്തിലുള്ള AI നടപടികൾ',
    recent_transactions: 'സമീപകാല ഇടപാടുകൾ',
    ai_recommendations: 'സാരഥി AI നിർദ്ദേശങ്ങൾ',
    
    add_expense: 'ചിലവ് ചേർക്കുക',
    save_changes: 'സേവ് ചെയ്യുക',
    export_data: 'ഡാറ്റ എക്‌സ്‌പോർട്ട് ചെയ്യുക',
    danger_zone: 'അപകട മേഖല',
    select_language: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    profile_details: 'പ്രൊഫൈൽ വിവരങ്ങൾ',
    financial_preferences: 'സാമ്പത്തിക മുൻഗണനകൾ',
    security: 'സുരക്ഷ',
  },
};

export function getTranslation(key: string, langName?: string): string {
  const activeLang = (langName || localStorage.getItem('sarthi_lang_pref') || 'English') as LanguageId;
  const langDict = TRANSLATIONS[activeLang] || TRANSLATIONS['English'];
  return langDict[key] || TRANSLATIONS['English'][key] || key;
}

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<LanguageId>(() => {
    return (localStorage.getItem('sarthi_lang_pref') as LanguageId) || 'English';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ language: string }>;
      if (customEvt.detail?.language) {
        setCurrentLang(customEvt.detail.language as LanguageId);
      }
    };

    window.addEventListener('sarthi-language-change', handleLangChange);
    return () => window.removeEventListener('sarthi-language-change', handleLangChange);
  }, []);

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['English'];
    return langDict[key] || TRANSLATIONS['English'][key] || key;
  };

  return { t, currentLang };
}
