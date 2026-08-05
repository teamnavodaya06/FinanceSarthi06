export const EXPENSE_CATEGORIES = [
  'HOUSING',
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'SHOPPING',
  'INVESTMENT',
  'DEBT_EMI',
  'OTHERS',
];

export const EXPENSE_SUBCATEGORIES: Record<string, string[]> = {
  HOUSING: ['Rent', 'Utilities', 'EMI', 'Maintenance', 'Brokerage'],
  FOOD: ['Restaurants', 'Groceries', 'Coffee', 'Delivery', 'Snacks'],
  TRANSPORT: ['Fuel', 'Uber/Ola', 'Public Transit', 'Vehicle Service', 'Parking'],
  UTILITIES: ['Electricity', 'Wi-Fi', 'Water', 'Mobile Bills', 'Gas'],
  ENTERTAINMENT: ['OTT', 'Movies', 'Gaming', 'Events', 'Nightlife'],
  HEALTHCARE: ['Medicines', 'Doctor', 'Lab Tests', 'Insurance', 'Fitness'],
  SHOPPING: ['Apparel', 'Electronics', 'Home Decor', 'Beauty', 'Accessories'],
  INVESTMENT: ['Mutual Funds', 'Stocks', 'Gold', 'NPS/PF', 'Crypto'],
  DEBT_EMI: ['Credit Card', 'Personal Loan', 'Home Loan', 'Car Loan'],
  OTHERS: ['Miscellaneous', 'Gifts', 'Travel', 'Business', 'Education'],
};

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Wallet',
  'Net Banking',
  'Cheque',
];

export const SUPPORTED_RECURRING_FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

// Sanitizer (same logic for notes and merchant titles)
import { sanitizeInput } from './validation';

// Field Validators
export function validateExpenseTitle(val: any): string | null {
  if (val === undefined || val === null || val === '') {
    return 'Expense title is required.';
  }
  const str = String(val).trim();
  if (str.length < 2) {
    return 'Expense title must be at least 2 characters long.';
  }
  if (str.length > 100) {
    return 'Expense title cannot exceed 100 characters.';
  }
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(str)) {
    return 'Malicious scripts are not allowed in titles.';
  }
  return null;
}

export function validateExpenseAmount(val: any): string | null {
  if (val === undefined || val === null || val === '') {
    return 'Expense amount is required.';
  }
  const num = Number(val);
  if (isNaN(num)) {
    return 'Expense amount must be a valid number and cannot contain letters or symbols.';
  }
  if (!isFinite(num)) {
    return 'Expense amount cannot be infinity.';
  }
  if (num <= 0) {
    return 'Expense amount must be greater than ₹0.';
  }
  // Max cap: 10 Lakh per transaction (₹1,000,000)
  if (num > 1000000) {
    return 'Expense amount cannot exceed ₹10 Lakh per transaction.';
  }
  return null;
}

export function validateExpenseCategory(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Please select a valid expense category.';
  }
  
  const categoryMap: Record<string, string> = {
    'housing / rent': 'HOUSING',
    'housing/rent': 'HOUSING',
    'housing': 'HOUSING',
    'food & groceries': 'FOOD',
    'food/groceries': 'FOOD',
    'food': 'FOOD',
    'transport & fuel': 'TRANSPORT',
    'transport/fuel': 'TRANSPORT',
    'transport': 'TRANSPORT',
    'travel': 'TRANSPORT',
    'bills & utilities': 'UTILITIES',
    'bills/utilities': 'UTILITIES',
    'utilities': 'UTILITIES',
    'entertainment & ott': 'ENTERTAINMENT',
    'entertainment/ott': 'ENTERTAINMENT',
    'entertainment': 'ENTERTAINMENT',
    'healthcare': 'HEALTHCARE',
    'medical': 'HEALTHCARE',
    'shopping': 'SHOPPING',
    'investment sip': 'INVESTMENT',
    'investment/sip': 'INVESTMENT',
    'investment': 'INVESTMENT',
    'debt emi': 'DEBT_EMI',
    'debt/emi': 'DEBT_EMI',
    'debt_emi': 'DEBT_EMI',
    'others': 'OTHERS',
    'other': 'OTHERS'
  };

  const normalized = categoryMap[val.toLowerCase().trim()] || val;
  if (!EXPENSE_CATEGORIES.includes(normalized)) {
    return `Invalid category: ${val}.`;
  }
  return null;
}

export function validateExpenseSubcategory(category: string, subcategory: any): string | null {
  if (subcategory === undefined || subcategory === null || subcategory === '') return null; // optional
  const list = EXPENSE_SUBCATEGORIES[category];
  if (!list) return 'Selected subcategory does not exist for this category.';
  if (!list.includes(subcategory)) {
    return `Subcategory must be one of: ${list.join(', ')}.`;
  }
  return null;
}

export function validatePaymentMethod(val: any): string | null {
  if (!val || typeof val !== 'string') {
    return 'Please select a valid payment method.';
  }
  
  const methodMap: Record<string, string> = {
    'upi': 'UPI',
    'cash': 'Cash',
    'debit card': 'Debit Card',
    'credit card': 'Credit Card',
    'bank transfer': 'Bank Transfer',
    'wallet': 'Wallet',
    'net banking': 'Net Banking',
    'cheque': 'Cheque'
  };

  const normalized = methodMap[val.toLowerCase().trim()] || val;
  if (!PAYMENT_METHODS.includes(normalized)) {
    return `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}.`;
  }
  return null;
}

export function validateExpenseDate(val: any): string | null {
  if (!val) return 'Expense date is required.';
  const timestamp = Date.parse(val);
  if (isNaN(timestamp)) {
    return 'Please provide a valid calendar date.';
  }
  // Reject extreme dates
  const year = new Date(val).getFullYear();
  if (year < 2000 || year > 2100) {
    return 'Expense date must be between the years 2000 and 2100.';
  }
  return null;
}

export function validateMerchant(val: any): string | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val !== 'string') return 'Merchant must be a string.';
  if (val.length > 100) return 'Merchant title cannot exceed 100 characters.';
  return null;
}

export function validateExpenseTags(tags: any): string | null {
  if (tags === undefined || tags === null) return null;
  if (!Array.isArray(tags)) return 'Tags must be a list array.';
  if (tags.length > 10) return 'You cannot attach more than 10 tags.';
  for (const t of tags) {
    if (typeof t !== 'string' || t.length > 30) {
      return 'Each tag must be a string under 30 characters.';
    }
  }
  return null;
}

// Unified validation handler for expenses
export function validateExpensePayload(payload: any) {
  const errors: { field: string; message: string }[] = [];

  const addError = (field: string, error: string | null) => {
    if (error) {
      errors.push({ field, message: error });
    }
  };

  addError('title', validateExpenseTitle(payload.title));
  addError('amount', validateExpenseAmount(payload.amount));
  addError('category', validateExpenseCategory(payload.category));
  addError('subcategory', validateExpenseSubcategory(payload.category, payload.subcategory));
  addError('paymentMethod', validatePaymentMethod(payload.paymentMethod));
  addError('date', validateExpenseDate(payload.date));
  addError('merchant', validateMerchant(payload.merchant));
  addError('tags', validateExpenseTags(payload.tags));

  if (payload.isRecurring) {
    if (!payload.recurrenceFrequency || !SUPPORTED_RECURRING_FREQUENCIES.includes(payload.recurrenceFrequency)) {
      errors.push({ field: 'recurrenceFrequency', message: 'Recurrence frequency is required for recurring subscriptions.' });
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
