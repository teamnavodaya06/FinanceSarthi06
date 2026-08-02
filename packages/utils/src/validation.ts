// Predefined enums for validation matching Zerodha / CRED / Stripe-grade strict constraints
export const SUPPORTED_EMPLOYMENT_TYPES = [
  'Private',
  'Government',
  'Business Owner',
  'Self Employed',
  'Freelancer',
  'Student',
  'Retired',
];

export const SUPPORTED_SALARY_TYPES = ['Salary', 'Business', 'Freelancer', 'Mixed', 'Freelance'];

export const SUPPORTED_FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

export const SUPPORTED_CITY_CATEGORIES = ['Metro', 'Tier1', 'Tier2', 'Tier3', 'Rural', 'Tier 1', 'Tier 2', 'Tier 3'];

export const SUPPORTED_RISK_PROFILES = ['Conservative', 'Balanced', 'Aggressive', 'Moderate', 'Moderate Conservative', 'Moderate Aggressive'];

export const SUPPORTED_TAX_REGIMES = ['Old', 'New'];

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

export const SUPPORTED_GOALS = [
  'Emergency Fund',
  'Retirement',
  'Wealth Creation',
  'Home',
  'Education',
  'Travel',
  'Wedding',
  'Business',
  'Children Education',
  'EMERGENCY_FUND',
  'VEHICLE',
  'HOUSE',
  'VACATION',
  'MARRIAGE',
  'RETIREMENT',
  'INVESTMENT',
  'OTHER',
];

// String Sanitizer (Trims, escapes HTML entities, strips script element codes)
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  let cleaned = str.trim();
  // Strip script tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Strip basic HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  // Escape potential malicious query chars
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return cleaned;
}

// Field Validators
export function validateMonthlyIncome(val: any): string | null {
  if (val === undefined || val === null || val === '') {
    return 'Monthly income is required and cannot be empty.';
  }
  const num = Number(val);
  if (isNaN(num)) {
    return 'Monthly income must be a valid number and cannot contain letters or symbols.';
  }
  if (!isFinite(num)) {
    return 'Monthly income cannot be infinity.';
  }
  if (num < 0) {
    return 'Monthly income cannot be negative.';
  }
  if (num === 0) {
    return 'Monthly income must be greater than ₹0.';
  }
  // Max cap: 10 Crore per month (₹100,000,000)
  if (num > 100000000) {
    return 'Monthly income cannot exceed ₹10 Crore per month.';
  }
  return null;
}

export function validateAdditionalIncomeSource(val: any, fieldName: string): string | null {
  if (val === undefined || val === null) return null;
  if (val === '') return null;
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }
  if (!isFinite(num)) {
    return `${fieldName} cannot be infinity.`;
  }
  if (num < 0) {
    return `${fieldName} cannot be negative.`;
  }
  return null;
}

export function validateEmploymentType(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Please choose a valid employment type.';
  }
  if (!SUPPORTED_EMPLOYMENT_TYPES.includes(val)) {
    return `Employment type must be one of: ${SUPPORTED_EMPLOYMENT_TYPES.join(', ')}.`;
  }
  return null;
}

export function validateSalaryType(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Please choose a valid salary classification type.';
  }
  if (!SUPPORTED_SALARY_TYPES.includes(val)) {
    return `Salary type must be one of: ${SUPPORTED_SALARY_TYPES.join(', ')}.`;
  }
  return null;
}

export function validateIncomeFrequency(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Income payout frequency is required.';
  }
  if (!SUPPORTED_FREQUENCIES.includes(val)) {
    return `Income frequency must be one of: ${SUPPORTED_FREQUENCIES.join(', ')}.`;
  }
  return null;
}

export function validateCityCategory(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'City category classification is required.';
  }
  if (!SUPPORTED_CITY_CATEGORIES.includes(val)) {
    return `City category must be one of: ${SUPPORTED_CITY_CATEGORIES.join(', ')}.`;
  }
  return null;
}

export function validateRiskProfile(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Risk profile profile classification is required.';
  }
  if (!SUPPORTED_RISK_PROFILES.includes(val)) {
    return `Risk profile must be one of: ${SUPPORTED_RISK_PROFILES.join(', ')}.`;
  }
  return null;
}

export function validateTaxRegime(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Tax regime option selection is required.';
  }
  if (!SUPPORTED_TAX_REGIMES.includes(val)) {
    return `Tax regime must be one of: ${SUPPORTED_TAX_REGIMES.join(', ')}.`;
  }
  return null;
}

export function validateCurrency(val: any): string | null {
  if (val === undefined || val === null) return null; // optional, defaults to INR
  if (typeof val !== 'string') return 'Currency code must be a string.';
  if (!SUPPORTED_CURRENCIES.includes(val)) {
    return `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}.`;
  }
  return null;
}

export function validateGoals(goals: any): string | null {
  if (goals === undefined || goals === null) return null;
  if (!Array.isArray(goals)) {
    return 'Financial goals must be represented as a list array.';
  }
  for (const g of goals) {
    if (typeof g !== 'string' || !SUPPORTED_GOALS.includes(g)) {
      return `Invalid financial goal: ${g}. Allowed goals: ${SUPPORTED_GOALS.filter(x => x === x.toLowerCase() || x.length > 5).join(', ')}`;
    }
  }
  return null;
}

export function validateNotes(val: any): string | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val !== 'string') {
    return 'Notes comments must be text.';
  }
  if (val.length > 500) {
    return 'Notes text exceeds maximum reasonable length limit (500 characters).';
  }
  return null;
}

// Unified validation handler returning details errors array ( Zerodha/CRED standard )
export function validateIncomePayload(payload: any) {
  const errors: { field: string; message: string }[] = [];

  const addError = (field: string, error: string | null) => {
    if (error) {
      errors.push({ field, message: error });
    }
  };

  addError('monthlyIncome', validateMonthlyIncome(payload.monthlyIncome));
  addError('bonusIncome', validateAdditionalIncomeSource(payload.bonusIncome, 'Bonus income'));
  addError('freelanceIncome', validateAdditionalIncomeSource(payload.freelanceIncome, 'Freelance income'));
  addError('rentalIncome', validateAdditionalIncomeSource(payload.rentalIncome, 'Rental income'));
  addError('investmentIncome', validateAdditionalIncomeSource(payload.investmentIncome, 'Investment income'));
  addError('otherIncome', validateAdditionalIncomeSource(payload.otherIncome, 'Other income'));
  addError('employmentType', validateEmploymentType(payload.employmentType));
  addError('salaryType', validateSalaryType(payload.salaryType));
  addError('incomeFrequency', validateIncomeFrequency(payload.incomeFrequency));
  addError('cityCategory', validateCityCategory(payload.cityCategory));
  addError('riskProfile', validateRiskProfile(payload.riskProfile));
  addError('taxRegime', validateTaxRegime(payload.taxRegime));
  addError('currency', validateCurrency(payload.currency));
  addError('financialPriority', validateGoals(payload.financialPriority));
  addError('notes', validateNotes(payload.notes));

  return {
    success: errors.length === 0,
    errors,
  };
}
