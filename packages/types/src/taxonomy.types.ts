export type TaxonomyType = 'EXPENSE' | 'INCOME' | 'INVESTMENT' | 'GOAL' | 'ASSET' | 'LIABILITY';

export interface TaxonomyNode {
  id: string;
  name: string;
  slug: string;
  type: TaxonomyType;
  description?: string;
  icon: string;
  color: string;
  displayOrder: number;
  parentId?: string;
  subcategories: string[];
  budgetCategory?: string;
  isDefault: boolean;
  isActive: boolean;
  userId?: string;
}

export interface TaxonomyOntology {
  sourceId: string;
  targetId: string;
  relationshipType: 'MAPS_TO_ASSET' | 'MAPS_TO_LIABILITY' | 'CONTRIBUTES_TO_GOAL';
}

export interface AIClassificationRule {
  categoryId: string;
  triggerType: 'BUDGET_OVERRUN' | 'VELOCITY_SPIKE' | 'UNUSED_SUBSCRIPTION';
  thresholdPct?: number;
  insightTemplate: string;
}
