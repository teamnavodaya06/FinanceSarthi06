import { IncomeService } from '../services/income.service';
import { IncomeRepository } from '../repositories/income.repository';
import { prisma } from '../config';

// Simple unit testing framework runner
async function runTests() {
  console.log('🧪 Starting Income CRUD Service Unit Tests...');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  // Define Mock Database Store
  let mockIncomesTable: any[] = [];
  let userTableMock: string[] = [];

  // Initialize service
  const service = new IncomeService();

  // Override repository with mock implementation
  const mockRepo: any = {
    findActiveByUserId: async (userId: string) => {
      return mockIncomesTable.find(inc => inc.userId === userId && inc.deletedAt === null) || null;
    },
    findById: async (id: string) => {
      return mockIncomesTable.find(inc => inc.id === id) || null;
    },
    create: async (userId: string, data: any) => {
      const record = {
        id: `mock-income-id-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        ...data,
      };
      mockIncomesTable.push(record);
      return record;
    },
    update: async (id: string, data: any) => {
      const idx = mockIncomesTable.findIndex(inc => inc.id === id);
      if (idx !== -1) {
        mockIncomesTable[idx] = {
          ...mockIncomesTable[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return mockIncomesTable[idx];
      }
      throw new Error('Not found');
    },
    softDelete: async (id: string) => {
      const idx = mockIncomesTable.findIndex(inc => inc.id === id);
      if (idx !== -1) {
        mockIncomesTable[idx].deletedAt = new Date();
        return mockIncomesTable[idx];
      }
      throw new Error('Not found');
    },
  };

  (service as any).incomeRepo = mockRepo;

  // Mock the ensureUserExists to bypass Prisma
  (service as any).ensureUserExists = async (userId: string) => {
    if (!userTableMock.includes(userId)) {
      userTableMock.push(userId);
    }
  };

  // Test 1: Successful Create & Auto-Calculations
  try {
    const payload = {
      monthlyIncome: 50000,
      salaryType: 'Salary',
      employmentType: 'Private',
      incomeFrequency: 'Monthly',
      cityCategory: 'Tier2',
      taxRegime: 'New',
      bonusIncome: 10000,
      otherIncome: 5000,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      riskProfile: 'Balanced',
      notes: 'Monthly salary plus regular incentives',
    };

    const created = await service.createIncome('user-1', 'user1@test.com', payload);
    
    assert(created.userId === 'user-1', 'Saves correct userId');
    assert(created.annualIncome === 600000, 'Calculates annualIncome (monthlyIncome * 12)');
    assert(created.totalAdditionalIncome === 15000, 'Calculates totalAdditionalIncome (bonus + other)');
    assert(created.totalIncome === 65000, 'Calculates totalIncome (monthly + additional)');
    assert(created.deletedAt === null, 'Init is not soft deleted');
  } catch (err: any) {
    assert(false, `Test 1 threw error: ${err.message}`);
  }

  // Test 2: Validation Limit (Negative Monthly Income)
  try {
    const payload = {
      monthlyIncome: -500,
      salaryType: 'Salary',
      employmentType: 'Private',
      incomeFrequency: 'Monthly',
      cityCategory: 'Tier2',
      taxRegime: 'New',
      riskProfile: 'Balanced',
    };
    await service.createIncome('user-2', 'user2@test.com', payload);
    assert(false, 'Should reject negative monthlyIncome');
  } catch (err: any) {
    assert(err.message.includes('Monthly income cannot be negative'), 'Rejects negative monthlyIncome with correct message');
  }

  // Test 3: Duplicate Prevention
  try {
    const payload = {
      monthlyIncome: 60000,
      salaryType: 'Salary',
      employmentType: 'Private',
      incomeFrequency: 'Monthly',
      cityCategory: 'Tier2',
      taxRegime: 'New',
      riskProfile: 'Balanced',
    };
    // Attempting duplicate creation on 'user-1' who already has an active profile
    await service.createIncome('user-1', 'user1@test.com', payload);
    assert(false, 'Should prevent duplicate active profiles');
  } catch (err: any) {
    assert(err.message.includes('already exists'), 'Prevents duplicates with correct exception message');
  }

  // Test 4: Read Active & Ownership Verification
  try {
    const active = await service.getActiveIncome('user-1');
    assert(active !== null && active.monthlyIncome === 50000, 'Reads active income profile correctly');

    const specific = await service.getIncomeById(active!.id, 'user-1');
    assert(specific.id === active!.id, 'Reads specific profile by ID');

    // Access by non-owner
    await service.getIncomeById(active!.id, 'user-evil');
    assert(false, 'Should restrict non-owner access');
  } catch (err: any) {
    assert(err.message.includes('Access denied'), 'Ownership validation raises Access Denied warning');
  }

  // Test 5: Update (PATCH & Calculations recalculation)
  try {
    const active = await service.getActiveIncome('user-1');
    assert(active !== null, 'Finds profile for update');
    
    // Partial update freelance income
    const updated = await service.updateIncome(active!.id, 'user-1', {
      freelanceIncome: 20000,
    });
    
    assert(updated.freelanceIncome === 20000, 'Updates partial field successfully');
    assert(updated.totalAdditionalIncome === 35000, 'Recalculates additional income sum (bonus 10k + other 5k + freelance 20k)');
    assert(updated.totalIncome === 85000, 'Recalculates total monthly income sum (monthly 50k + additional 35k)');
  } catch (err: any) {
    assert(false, `Test 5 threw error: ${err.message}`);
  }

  // Test 6: Soft Delete
  try {
    const active = await service.getActiveIncome('user-1');
    assert(active !== null, 'Finds profile for soft delete');

    const deleted = await service.softDeleteIncome(active!.id, 'user-1');
    assert(deleted.deletedAt !== null, 'Soft delete updates deletedAt field');

    const activeAfterDelete = await service.getActiveIncome('user-1');
    assert(activeAfterDelete === null, 'Active profile search returns null after soft delete');
  } catch (err: any) {
    assert(false, `Test 6 threw error: ${err.message}`);
  }

  console.log(`\n📊 Test Execution Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
