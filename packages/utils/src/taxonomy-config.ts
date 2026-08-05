import { TaxonomyNode, TaxonomyOntology } from '@financesarthi/types';

export const DEFAULT_TAXONOMY_NODES: TaxonomyNode[] = [
  // ==========================================
  // EXPENSE CATEGORIES
  // ==========================================
  {
    id: 'tax-food',
    name: 'Food & Dining',
    slug: 'food-dining',
    type: 'EXPENSE',
    description: 'Restaurants, food delivery, groceries and dining out',
    icon: 'Utensils',
    color: '#F97316',
    displayOrder: 1,
    subcategories: ['Restaurants', 'Food Delivery', 'Groceries', 'Coffee', 'Fast Food', 'Snacks', 'Dining Out'],
    budgetCategory: 'Wants',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'tax-transport',
    name: 'Transportation',
    slug: 'transportation',
    type: 'EXPENSE',
    description: 'Fuel, public transit, metro, and ride sharing services',
    icon: 'Car',
    color: '#3B82F6',
    displayOrder: 2,
    subcategories: ['Fuel', 'Ride Sharing', 'Taxi', 'Metro', 'Train', 'Bus', 'Parking', 'Vehicle Maintenance'],
    budgetCategory: 'Needs',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'tax-shopping',
    name: 'Shopping',
    slug: 'shopping',
    type: 'EXPENSE',
    description: 'Apparel, electronics, fashion, and online shopping portals',
    icon: 'ShoppingBag',
    color: '#A855F7',
    displayOrder: 3,
    subcategories: ['Online Shopping', 'Electronics', 'Fashion', 'Furniture', 'Accessories', 'Grocery Shopping'],
    budgetCategory: 'Wants',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'tax-bills',
    name: 'Bills & Utilities',
    slug: 'bills-utilities',
    type: 'EXPENSE',
    description: 'Electricity, water, gas, internet and mobile recharges',
    icon: 'Receipt',
    color: '#F59E0B',
    displayOrder: 4,
    subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Mobile Recharge', 'DTH'],
    budgetCategory: 'Needs',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'tax-housing',
    name: 'Housing',
    slug: 'housing',
    type: 'EXPENSE',
    description: 'House rent, repairs, tax, and maintenance costs',
    icon: 'Home',
    color: '#10B981',
    displayOrder: 5,
    subcategories: ['Rent', 'Maintenance', 'Property Tax', 'Repairs', 'Furniture'],
    budgetCategory: 'Needs',
    isDefault: true,
    isActive: true,
  },

  // ==========================================
  // INCOME CATEGORIES
  // ==========================================
  {
    id: 'tax-inc-salary',
    name: 'Active Salary',
    slug: 'active-salary',
    type: 'INCOME',
    description: 'Monthly payroll deposits, basic salary, allowances',
    icon: 'Briefcase',
    color: '#10B981',
    displayOrder: 1,
    subcategories: ['Base Salary', 'HRA', 'Special Allowance', 'PF Sweep'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'tax-inc-freelance',
    name: 'Freelance & Side Hustles',
    slug: 'freelance-side-hustles',
    type: 'INCOME',
    description: 'Consulting contracts, client paychecks, side gig revenues',
    icon: 'Laptop',
    color: '#8B5CF6',
    displayOrder: 2,
    subcategories: ['Consulting', 'AdSense', 'Contract Pay'],
    isDefault: true,
    isActive: true,
  },

  // ==========================================
  // INVESTMENT CATEGORIES
  // ==========================================
  {
    id: 'tax-inv-equity',
    name: 'Equities & Mutual Funds',
    slug: 'equities-mutual-funds',
    type: 'INVESTMENT',
    description: 'Direct stock market investments, equity SIP mutual funds',
    icon: 'TrendingUp',
    color: '#0EA5E9',
    displayOrder: 1,
    subcategories: ['Direct Stocks', 'Index Funds', 'Elss Tax Saver', 'Small Cap'],
    isDefault: true,
    isActive: true,
  },

  // ==========================================
  // GOAL CATEGORIES
  // ==========================================
  {
    id: 'tax-goal-emergency',
    name: 'Emergency Buffer Fund',
    slug: 'emergency-buffer-fund',
    type: 'GOAL',
    description: '6 months of living expenses safety reserve',
    icon: 'Shield',
    color: '#EF4444',
    displayOrder: 1,
    subcategories: ['Medical Buffer', 'Job Loss Buffer'],
    isDefault: true,
    isActive: true,
  },

  // ==========================================
  // ASSET CATEGORIES
  // ==========================================
  {
    id: 'tax-asset-bank',
    name: 'Savings & Liquidity',
    slug: 'savings-liquidity',
    type: 'ASSET',
    description: 'Bank savings balances, fixed deposits, sweep balances',
    icon: 'Wallet',
    color: '#6366F1',
    displayOrder: 1,
    subcategories: ['Savings Account', 'Sweep Deposit', 'Fixed Deposit'],
    isDefault: true,
    isActive: true,
  },

  // ==========================================
  // LIABILITY CATEGORIES
  // ==========================================
  {
    id: 'tax-liab-loan',
    name: 'Secured Loans EMI',
    slug: 'secured-loans-emi',
    type: 'LIABILITY',
    description: 'Home loan principal, vehicle loans outstanding',
    icon: 'CreditCard',
    color: '#F43F5E',
    displayOrder: 1,
    subcategories: ['Home Loan', 'Car Loan'],
    isDefault: true,
    isActive: true,
  },
];

export const DEFAULT_ONTOLOGY_MAPPINGS: TaxonomyOntology[] = [
  {
    sourceId: 'tax-inv-equity',
    targetId: 'tax-asset-bank',
    relationshipType: 'MAPS_TO_ASSET',
  },
];

export const DEFAULT_MERCHANT_TAXONOMY_MAPPINGS = [
  { merchant: 'Swiggy', category: 'food-dining', subcategory: 'Food Delivery' },
  { merchant: 'Zomato', category: 'food-dining', subcategory: 'Food Delivery' },
  { merchant: 'Uber', category: 'transportation', subcategory: 'Ride Sharing' },
  { merchant: 'Ola', category: 'transportation', subcategory: 'Ride Sharing' },
  { merchant: 'Amazon', category: 'shopping', subcategory: 'Online Shopping' },
  { merchant: 'Flipkart', category: 'shopping', subcategory: 'Online Shopping' },
  { merchant: 'Myntra', category: 'shopping', subcategory: 'Fashion' },
  { merchant: 'DMart', category: 'food-dining', subcategory: 'Groceries' },
];

export function classifyTaxonomyMerchant(merchantName: string): { category: string; subcategory?: string } {
  const name = merchantName.toLowerCase().trim();
  const matched = DEFAULT_MERCHANT_TAXONOMY_MAPPINGS.find(m => m.merchant.toLowerCase() === name);
  if (matched) {
    return { category: matched.category, subcategory: matched.subcategory };
  }

  // Regex matches
  if (name.includes('swiggy') || name.includes('zomato') || name.includes('food') || name.includes('eat') || name.includes('restaurant')) {
    return { category: 'food-dining', subcategory: 'Food Delivery' };
  }
  if (name.includes('uber') || name.includes('ola') || name.includes('cab') || name.includes('taxi') || name.includes('ride')) {
    return { category: 'transportation', subcategory: 'Ride Sharing' };
  }
  if (name.includes('petrol') || name.includes('fuel') || name.includes('shell') || name.includes('hpcl') || name.includes('iocl')) {
    return { category: 'transportation', subcategory: 'Fuel' };
  }

  // Default fallback
  return { category: 'food-dining', subcategory: 'Groceries' };
}
