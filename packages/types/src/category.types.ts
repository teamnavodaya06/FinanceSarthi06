export interface ExpenseCategoryConfig {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  displayOrder: number;
  parentCategory?: string;
  subcategories: string[];
  budgetEligible: boolean;
  analyticsEnabled: boolean;
  aiEnabled: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export interface MerchantMapping {
  merchant: string;
  category: string;
  subcategory?: string;
}

export interface CategoryRule {
  categoryId: string;
  triggerType: 'BUDGET_OVERRUN' | 'VELOCITY_SPIKE' | 'UNUSED_SUBSCRIPTION';
  thresholdPct?: number;
  insightTemplate: string;
}
