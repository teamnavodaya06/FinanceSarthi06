import { TaxonomyRepository } from '../repositories/taxonomy.repository';
import { classifyTaxonomyMerchant, sanitizeInput } from '@financesarthi/utils';

export class TaxonomyService {
  private taxonomyRepo = new TaxonomyRepository();

  async seedDefaults() {
    await this.taxonomyRepo.seedDefaultTaxonomy();
  }

  async getNodes(userId?: string, type?: string) {
    await this.seedDefaults();
    return this.taxonomyRepo.getNodes(userId, type);
  }

  async getNodeById(id: string, userId?: string) {
    const node = await this.taxonomyRepo.findById(id);
    if (!node) {
      throw new Error('Taxonomy node not found');
    }
    if (!node.isDefault && node.userId !== userId) {
      throw new Error('Access denied: Unauthorized view access');
    }
    return node;
  }

  async createCustomNode(userId: string, data: {
    name: string;
    type: 'EXPENSE' | 'INCOME' | 'INVESTMENT' | 'GOAL' | 'ASSET' | 'LIABILITY';
    description?: string;
    icon: string;
    color: string;
    parentId?: string;
    subcategories?: string[];
    budgetCategory?: string;
  }) {
    const name = sanitizeInput(data.name).trim();
    const desc = data.description ? sanitizeInput(data.description).trim() : undefined;
    const icon = data.icon ? sanitizeInput(data.icon).trim() : 'HelpCircle';
    const color = data.color ? sanitizeInput(data.color).trim() : '#94A3B8';
    const budgetCategory = data.budgetCategory ? sanitizeInput(data.budgetCategory).trim() : undefined;

    if (!name) {
      throw new Error('Name is required.');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.taxonomyRepo.findBySlug(slug, userId);
    if (existing) {
      throw new Error(`Taxonomy node with name "${name}" already exists.`);
    }

    if (data.parentId) {
      const parent = await this.taxonomyRepo.findBySlug(data.parentId, userId);
      if (!parent) {
        throw new Error(`Parent node "${data.parentId}" does not exist.`);
      }
    }

    return this.taxonomyRepo.create({
      name,
      slug,
      type: data.type,
      description: desc,
      icon,
      color,
      parentId: data.parentId || undefined,
      subcategories: data.subcategories || [],
      budgetCategory,
      isDefault: false,
      isActive: true,
      userId,
    });
  }

  async updateCustomNode(id: string, userId: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId?: string;
    subcategories?: string[];
    budgetCategory?: string;
    isActive?: boolean;
  }) {
    const existing = await this.taxonomyRepo.findById(id);
    if (!existing) {
      throw new Error('Taxonomy node not found.');
    }
    if (existing.isDefault) {
      throw new Error('System default taxonomy nodes cannot be modified.');
    }
    if (existing.userId !== userId) {
      throw new Error('Access denied: Unauthorized write access.');
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = sanitizeInput(data.name).trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description ? sanitizeInput(data.description).trim() : null;
    }
    if (data.icon !== undefined) {
      updateData.icon = sanitizeInput(data.icon).trim();
    }
    if (data.color !== undefined) {
      updateData.color = sanitizeInput(data.color).trim();
    }
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId || null;
    }
    if (data.subcategories !== undefined) {
      updateData.subcategories = data.subcategories;
    }
    if (data.budgetCategory !== undefined) {
      updateData.budgetCategory = data.budgetCategory || null;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return this.taxonomyRepo.update(id, updateData);
  }

  async deleteCustomNode(id: string, userId: string) {
    const existing = await this.taxonomyRepo.findById(id);
    if (!existing) {
      throw new Error('Taxonomy node not found.');
    }
    if (existing.isDefault) {
      throw new Error('System default taxonomy nodes cannot be deleted.');
    }
    if (existing.userId !== userId) {
      throw new Error('Access denied: Unauthorized delete access.');
    }

    return this.taxonomyRepo.deleteCustom(id, userId);
  }

  async classifyMerchant(merchantName: string, userId?: string) {
    const classification = classifyTaxonomyMerchant(merchantName);
    try {
      const node = await this.taxonomyRepo.findBySlug(classification.category, userId);
      return {
        category: node,
        subcategory: classification.subcategory,
      };
    } catch {
      return {
        category: null,
        subcategory: classification.subcategory,
      };
    }
  }
}
export const taxonomyService = new TaxonomyService();
