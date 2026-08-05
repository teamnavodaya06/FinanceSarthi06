import { ExpenseCategoryConfig, MerchantMapping } from '@financesarthi/types';

export const DEFAULT_PARENT_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    slug: 'food-dining',
    description: 'Restaurants, food delivery, groceries, dining out and snacks',
    icon: 'Utensils',
    color: '#F97316', // Orange
    displayOrder: 1,
    subcategories: ['Restaurants', 'Food Delivery', 'Groceries', 'Coffee', 'Fast Food', 'Snacks', 'Dining Out'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-transport',
    name: 'Transportation',
    slug: 'transportation',
    description: 'Fuel, public transit, metro, and ride sharing services',
    icon: 'Car',
    color: '#3B82F6', // Blue
    displayOrder: 2,
    subcategories: ['Fuel', 'Ride Sharing', 'Taxi', 'Metro', 'Train', 'Bus', 'Parking', 'Vehicle Maintenance'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    slug: 'shopping',
    description: 'Apparel, electronics, fashion, and online shopping portals',
    icon: 'ShoppingBag',
    color: '#A855F7', // Purple
    displayOrder: 3,
    subcategories: ['Online Shopping', 'Electronics', 'Fashion', 'Furniture', 'Accessories', 'Grocery Shopping'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-bills',
    name: 'Bills & Utilities',
    slug: 'bills-utilities',
    description: 'Electricity, water, gas, internet and mobile recharges',
    icon: 'Receipt',
    color: '#F59E0B', // Amber
    displayOrder: 4,
    subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Mobile Recharge', 'DTH'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-housing',
    name: 'Housing',
    slug: 'housing',
    description: 'House rent, repairs, tax, and maintenance costs',
    icon: 'Home',
    color: '#10B981', // Emerald Green
    displayOrder: 5,
    subcategories: ['Rent', 'Maintenance', 'Property Tax', 'Repairs', 'Furniture'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-healthcare',
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Medicines, lab tests, consultation, fitness and health checkups',
    icon: 'HeartPulse',
    color: '#EF4444', // Red
    displayOrder: 6,
    subcategories: ['Doctor', 'Hospital', 'Medicines', 'Health Insurance', 'Dental', 'Fitness'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-education',
    name: 'Education',
    slug: 'education',
    description: 'Tuition fees, textbooks, online courses, and examinations',
    icon: 'GraduationCap',
    color: '#6366F1', // Indigo
    displayOrder: 7,
    subcategories: ['Books', 'Courses', 'Tuition', 'College Fees', 'Exams'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, gaming, live events, concerts and nightlife',
    icon: 'Film',
    color: '#EC4899', // Pink
    displayOrder: 8,
    subcategories: ['Movies', 'OTT', 'Music', 'Games', 'Events', 'Sports'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-travel',
    name: 'Travel',
    slug: 'travel',
    description: 'Flight tickets, hotel bookings, local transport and vacations',
    icon: 'Plane',
    color: '#0EA5E9', // Sky Blue
    displayOrder: 9,
    subcategories: ['Flights', 'Hotels', 'Food During Travel', 'Local Transport', 'Visa'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-insurance',
    name: 'Insurance',
    slug: 'insurance',
    description: 'Life, health, vehicle, term and travel insurance policy premium payments',
    icon: 'Shield',
    color: '#06B6D4', // Cyan
    displayOrder: 10,
    subcategories: ['Health Insurance', 'Vehicle Insurance', 'Life Insurance', 'Travel Insurance'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-investments',
    name: 'Investments',
    slug: 'investments',
    description: 'Mutual fund SIPs, stocks, gold, PPF, NPS, and fixed deposits',
    icon: 'TrendingUp',
    color: '#10B981', // Green
    displayOrder: 11,
    subcategories: ['Mutual Funds', 'Stocks', 'Gold', 'PPF', 'NPS', 'Fixed Deposit'],
    budgetEligible: false,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-taxes',
    name: 'Taxes',
    slug: 'taxes',
    description: 'Income tax, GST, professional tax, and customs duty',
    icon: 'Percent',
    color: '#F43F5E', // Rose
    displayOrder: 12,
    subcategories: ['Income Tax', 'GST', 'Professional Tax'],
    budgetEligible: false,
    analyticsEnabled: true,
    aiEnabled: false,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-personalcare',
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Salon, cosmetics, spa, personal hygiene, and beauty products',
    icon: 'Sparkles',
    color: '#8B5CF6', // Lavender
    displayOrder: 13,
    subcategories: ['Salon', 'Spa', 'Cosmetics', 'Hygiene'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-business',
    name: 'Business',
    slug: 'business',
    description: 'Office supplies, marketing, client meetings, SaaS subscriptions',
    icon: 'Briefcase',
    color: '#64748B', // Slate Gray
    displayOrder: 14,
    subcategories: ['Office Supplies', 'Software', 'Travel', 'Marketing', 'Clients'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-family',
    name: 'Family',
    slug: 'family',
    description: 'School fees, kids allowance, elderly care, and home supplies',
    icon: 'Users',
    color: '#14B8A6', // Teal
    displayOrder: 15,
    subcategories: ['School Fees', 'Home Supplies', 'Kids Allowance', 'Elderly Care'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-gifts',
    name: 'Gifts & Donations',
    slug: 'gifts-donations',
    description: 'Wedding gifts, NGO donation receipts, religious offering and birthday presents',
    icon: 'Gift',
    color: '#EAB308', // Yellow
    displayOrder: 16,
    subcategories: ['Wedding Gifts', 'NGO Donations', 'Birthday Presents', 'Offerings'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: false,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-subscriptions',
    name: 'Subscriptions',
    slug: 'subscriptions',
    description: 'Streaming services, SaaS software licenses, cloud storage, gym memberships',
    icon: 'Tv',
    color: '#D946EF', // Fuchsia
    displayOrder: 17,
    subcategories: ['Netflix', 'Spotify', 'Amazon Prime', 'YouTube Premium', 'Cloud Storage', 'Software'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-debt',
    name: 'Debt & EMI',
    slug: 'debt-emi',
    description: 'Credit card bill payments, car loan EMI, home loan interest, and personal loan payments',
    icon: 'CreditCard',
    color: '#EF4444', // Red
    displayOrder: 18,
    subcategories: ['Home Loan EMI', 'Car Loan EMI', 'Personal Loan EMI', 'Credit Card Payment'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: true,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-savings',
    name: 'Savings Transfers',
    slug: 'savings-transfers',
    description: 'Fund transfers to emergency deposits, savings account balance sweeps, and liquid reserves',
    icon: 'ArrowLeftRight',
    color: '#7C3AED', // Violet
    displayOrder: 19,
    subcategories: ['Emergency Savings', 'Sweep In', 'Liquid Transfer'],
    budgetEligible: false,
    analyticsEnabled: false,
    aiEnabled: false,
    isDefault: true,
    isActive: true,
  },
  {
    id: 'cat-misc',
    name: 'Miscellaneous',
    slug: 'miscellaneous',
    description: 'Untracked logs, custom minor adjustments, cash leakages',
    icon: 'HelpCircle',
    color: '#94A3B8', // Gray
    displayOrder: 20,
    subcategories: ['Miscellaneous', 'Unexplained Leak', 'Minor Sweep'],
    budgetEligible: true,
    analyticsEnabled: true,
    aiEnabled: false,
    isDefault: true,
    isActive: true,
  },
];

export const DEFAULT_MERCHANT_MAPPINGS: MerchantMapping[] = [
  { merchant: 'Swiggy', category: 'cat-food', subcategory: 'Food Delivery' },
  { merchant: 'Zomato', category: 'cat-food', subcategory: 'Food Delivery' },
  { merchant: 'Uber', category: 'cat-transport', subcategory: 'Ride Sharing' },
  { merchant: 'Ola', category: 'cat-transport', subcategory: 'Ride Sharing' },
  { merchant: 'Amazon', category: 'cat-shopping', subcategory: 'Online Shopping' },
  { merchant: 'Flipkart', category: 'cat-shopping', subcategory: 'Online Shopping' },
  { merchant: 'Myntra', category: 'cat-shopping', subcategory: 'Fashion' },
  { merchant: 'DMart', category: 'cat-food', subcategory: 'Groceries' },
  { merchant: 'Netflix', category: 'cat-subscriptions', subcategory: 'Netflix' },
  { merchant: 'Spotify', category: 'cat-subscriptions', subcategory: 'Spotify' },
  { merchant: 'BookMyShow', category: 'cat-entertainment', subcategory: 'Movies' },
];

export function classifyMerchant(merchantName: string): { category: string; subcategory?: string } {
  const name = merchantName.toLowerCase().trim();
  const matched = DEFAULT_MERCHANT_MAPPINGS.find(m => m.merchant.toLowerCase() === name);
  if (matched) {
    return { category: matched.category, subcategory: matched.subcategory };
  }

  // Smart regex classifications
  if (name.includes('swiggy') || name.includes('zomato') || name.includes('food') || name.includes('eat') || name.includes('restaurant')) {
    return { category: 'cat-food', subcategory: 'Food Delivery' };
  }
  if (name.includes('uber') || name.includes('ola') || name.includes('cab') || name.includes('taxi') || name.includes('ride')) {
    return { category: 'cat-transport', subcategory: 'Ride Sharing' };
  }
  if (name.includes('petrol') || name.includes('fuel') || name.includes('shell') || name.includes('hpcl') || name.includes('iocl') || name.includes('bpcl')) {
    return { category: 'cat-transport', subcategory: 'Fuel' };
  }
  if (name.includes('hospital') || name.includes('clinic') || name.includes('med') || name.includes('pharmacy') || name.includes('dr.') || name.includes('doctor')) {
    return { category: 'cat-healthcare', subcategory: 'Medicines' };
  }
  if (name.includes('netflix') || name.includes('spotify') || name.includes('prime') || name.includes('youtube') || name.includes('sub')) {
    return { category: 'cat-subscriptions', subcategory: 'Software' };
  }
  if (name.includes('lic') || name.includes('insurance') || name.includes('premium')) {
    return { category: 'cat-insurance', subcategory: 'Life Insurance' };
  }
  if (name.includes('mutual') || name.includes('fund') || name.includes('sip') || name.includes('zerodha') || name.includes('groww') || name.includes('stocks')) {
    return { category: 'cat-investments', subcategory: 'Mutual Funds' };
  }

  // Default fallback
  return { category: 'cat-misc', subcategory: 'Miscellaneous' };
}
