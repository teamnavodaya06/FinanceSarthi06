import { ExpenseCategoryRepository } from '../repositories/expense-category.repository';
import { classifyMerchant as classifyMerchantUtil, sanitizeInput } from '@financesarthi/utils';

export class ExpenseCategoryService {
  private categoryRepo = new ExpenseCategoryRepository();

  async seedDefaults() {
    await this.categoryRepo.seedSystemCategories();
  }

  async getAllCategories(userId?: string) {
    // Automatically make sure default seed exists
    await this.seedDefaults();
    return this.categoryRepo.getCategories(userId);
  }

  async getCategoryById(id: string, userId?: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new Error('Expense category not found');
    }
    // Verify visibility: either default system category OR owned by this user
    if (!category.isDefault && category.userId !== userId) {
      throw new Error('Access denied: Unauthorized view access');
    }
    return category;
  }

  async getCategoryBySlug(slug: string, userId?: string) {
    const category = await this.categoryRepo.findBySlug(slug, userId);
    if (!category) {
      throw new Error('Expense category not found');
    }
    return category;
  }

  async createCustomCategory(userId: string, data: {
    name: string;
    description?: string;
    icon: string;
    color: string;
    parentCategory?: string;
    subcategories?: string[];
  }) {
    // 1. Sanitize text fields
    const sanitizedName = sanitizeInput(data.name).trim();
    const sanitizedDesc = data.description ? sanitizeInput(data.description).trim() : undefined;
    const icon = data.icon ? sanitizeInput(data.icon).trim() : 'HelpCircle';
    const color = data.color ? sanitizeInput(data.color).trim() : '#94A3B8';

    if (!sanitizedName) {
      throw new Error('Category name is required.');
    }

    // 2. Generate slug and ensure uniqueness
    const slug = sanitizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.categoryRepo.findBySlug(slug, userId);
    if (existing) {
      throw new Error(`Category with name "${sanitizedName}" already exists.`);
    }

    // 3. Parent category validation (if specified)
    if (data.parentCategory) {
      const parent = await this.categoryRepo.findBySlug(data.parentCategory, userId);
      if (!parent) {
        throw new Error(`Parent category "${data.parentCategory}" does not exist.`);
      }
    }

    // 4. Save custom category
    return this.categoryRepo.create({
      name: sanitizedName,
      slug,
      description: sanitizedDesc,
      icon,
      color,
      parentCategory: data.parentCategory || undefined,
      subcategories: data.subcategories || [],
      budgetEligible: true,
      analyticsEnabled: true,
      aiEnabled: true,
      isDefault: false,
      isActive: true,
      userId,
    });
  }

  async updateCustomCategory(id: string, userId: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    parentCategory?: string;
    subcategories?: string[];
    isActive?: boolean;
  }) {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    if (existing.isDefault) {
      throw new Error('System default categories cannot be modified.');
    }
    if (existing.userId !== userId) {
      throw new Error('Access denied: Unauthorized write access.');
    }

    // Merge and validate
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
    if (data.parentCategory !== undefined) {
      updateData.parentCategory = data.parentCategory || null;
    }
    if (data.subcategories !== undefined) {
      updateData.subcategories = data.subcategories;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return this.categoryRepo.update(id, updateData);
  }

  async deleteCustomCategory(id: string, userId: string) {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    if (existing.isDefault) {
      throw new Error('System default categories cannot be deleted.');
    }
    if (existing.userId !== userId) {
      throw new Error('Access denied: Unauthorized delete access.');
    }

    return this.categoryRepo.deleteCustom(id, userId);
  }

  async suggestMerchantCategory(merchantName: string, userId?: string) {
    const classification = classifyMerchantUtil(merchantName);
    
    // Attempt to retrieve full Category details by slug
    try {
      const category = await this.categoryRepo.findBySlug(classification.category, userId);
      return {
        category,
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
export const expenseCategoryService = new ExpenseCategoryService();
