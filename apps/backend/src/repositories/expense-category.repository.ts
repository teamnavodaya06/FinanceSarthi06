import { prisma } from '../config';
import { DEFAULT_PARENT_CATEGORIES } from '@financesarthi/utils';

export class ExpenseCategoryRepository {
  async getCategories(userId?: string) {
    // Return all default categories PLUS user custom categories
    return prisma.expenseCategory.findMany({
      where: {
        OR: [
          { isDefault: true },
          userId ? { userId } : { id: 'none' }, // Skip if no user
        ],
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.expenseCategory.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string, userId?: string) {
    return prisma.expenseCategory.findFirst({
      where: {
        slug,
        OR: [
          { isDefault: true },
          userId ? { userId } : { id: 'none' },
        ],
      },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    icon: string;
    color: string;
    displayOrder?: number;
    parentCategory?: string;
    subcategories: string[];
    budgetEligible?: boolean;
    analyticsEnabled?: boolean;
    aiEnabled?: boolean;
    isDefault?: boolean;
    isActive?: boolean;
    userId?: string;
  }) {
    return prisma.expenseCategory.create({
      data,
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    displayOrder?: number;
    parentCategory?: string;
    subcategories?: string[];
    budgetEligible?: boolean;
    analyticsEnabled?: boolean;
    aiEnabled?: boolean;
    isActive?: boolean;
  }) {
    return prisma.expenseCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCustom(id: string, userId: string) {
    return prisma.expenseCategory.deleteMany({
      where: {
        id,
        userId,
        isDefault: false, // Double safety: never delete system defaults
      },
    });
  }

  /**
   * Seeds default system parent categories if table is empty
   */
  async seedSystemCategories() {
    try {
      const count = await prisma.expenseCategory.count({
        where: { isDefault: true },
      });

      if (count === 0) {
        console.log('🌱 Seeding default system expense categories...');
        for (const cat of DEFAULT_PARENT_CATEGORIES) {
          await prisma.expenseCategory.create({
            data: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
              icon: cat.icon,
              color: cat.color,
              displayOrder: cat.displayOrder,
              parentCategory: cat.parentCategory || null,
              subcategories: cat.subcategories,
              budgetEligible: cat.budgetEligible,
              analyticsEnabled: cat.analyticsEnabled,
              aiEnabled: cat.aiEnabled,
              isDefault: true,
              isActive: true,
            },
          });
        }
        console.log('✅ System expense categories seeded successfully.');
      }
    } catch (err) {
      console.error('Error seeding system expense categories:', err);
    }
  }
}
