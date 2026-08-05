import { prisma } from '../config';
import { DEFAULT_TAXONOMY_NODES } from '@financesarthi/utils';

export class TaxonomyRepository {
  async getNodes(userId?: string, type?: string) {
    return prisma.taxonomyNode.findMany({
      where: {
        AND: [
          {
            OR: [
              { isDefault: true },
              userId ? { userId } : { id: 'none' },
            ],
          },
          type ? { type } : {},
          { isActive: true },
        ],
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.taxonomyNode.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string, userId?: string) {
    return prisma.taxonomyNode.findFirst({
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
    type: string;
    description?: string;
    icon: string;
    color: string;
    displayOrder?: number;
    parentId?: string;
    subcategories: string[];
    budgetCategory?: string;
    isDefault?: boolean;
    isActive?: boolean;
    userId?: string;
  }) {
    return prisma.taxonomyNode.create({
      data,
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    displayOrder?: number;
    parentId?: string;
    subcategories?: string[];
    budgetCategory?: string;
    isActive?: boolean;
  }) {
    return prisma.taxonomyNode.update({
      where: { id },
      data,
    });
  }

  async deleteCustom(id: string, userId: string) {
    return prisma.taxonomyNode.deleteMany({
      where: {
        id,
        userId,
        isDefault: false,
      },
    });
  }

  async seedDefaultTaxonomy() {
    try {
      const count = await prisma.taxonomyNode.count({
        where: { isDefault: true },
      });

      if (count === 0) {
        console.log('🌱 Seeding default Financial Taxonomy nodes...');
        for (const node of DEFAULT_TAXONOMY_NODES) {
          await prisma.taxonomyNode.create({
            data: {
              id: node.id,
              name: node.name,
              slug: node.slug,
              type: node.type,
              description: node.description || null,
              icon: node.icon,
              color: node.color,
              displayOrder: node.displayOrder,
              parentId: node.parentId || null,
              subcategories: node.subcategories,
              budgetCategory: node.budgetCategory || null,
              isDefault: true,
              isActive: true,
            },
          });
        }
        console.log('✅ Default Financial Taxonomy nodes seeded.');
      }
    } catch (err) {
      console.error('Error seeding Financial Taxonomy nodes:', err);
    }
  }
}
export const taxonomyRepository = new TaxonomyRepository();
