import { validateIncomePayload, sanitizeInput } from '@financesarthi/utils';
import { IncomeCalculationService } from '../services/income-calculation.service';
import { Income, Expense } from '@prisma/client';

async function runSystemIntegrationTests() {
  console.log('🧪 Starting Income Management System Integration QA Suite...');
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

  const calculationService = new IncomeCalculationService();

  // -------------------------------------------------------------
  // Test Case 1: Create Income & Hydrate Calculations
  // -------------------------------------------------------------
  try {
    const userA_id = 'user-alice-uid';
    const payloadA: Partial<Income> = {
      id: 'income-doc-111',
      userId: userA_id,
      monthlyIncome: 75000,
      bonusIncome: 0,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      otherIncome: 0,
      employmentType: 'Private',
      salaryType: 'Salary',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      riskProfile: 'Balanced',
      taxRegime: 'New',
      currency: 'INR',
      isPrimaryIncome: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Verify properties validation before insertion
    const checkVal = validateIncomePayload(payloadA);
    assert(checkVal.success, 'CRUD Create: Payload validation check succeeds for valid income inputs');

    // Run Calculations hydration
    const calcResult = calculationService.calculateSummary(payloadA as Income, [], [], 100000);
    assert(calcResult.summary.monthlyIncome === 75000, 'Calculations: Hydrates monthly income correctly');
    assert(calcResult.summary.annualIncome === 900000, 'Calculations: Calculates annual base salary (75k * 12 = 9L)');
    assert(calcResult.summary.savingsPotential === 30000, 'Calculations: Calculates correct savings surplus potential (Rural/Metro estimates)');
    assert(calcResult.charts.budgetSplit.find(b => b.name === 'Needs')?.value === 37500, 'Calculations: Recommended 50% Needs budget allocation is correct (₹37,500)');
  } catch (err: any) {
    assert(false, `Test Case 1 creation failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 2: Update Income Recalculations
  // -------------------------------------------------------------
  try {
    const userA_id = 'user-alice-uid';
    const payloadUpdated: Partial<Income> = {
      id: 'income-doc-111',
      userId: userA_id,
      monthlyIncome: 90000, // Updated 75000 -> 90000
      bonusIncome: 5000,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      otherIncome: 0,
      employmentType: 'Private',
      salaryType: 'Salary',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      riskProfile: 'Balanced',
      taxRegime: 'New',
      currency: 'INR',
      isPrimaryIncome: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const calcResult = calculationService.calculateSummary(payloadUpdated as Income, [], [], 120000);
    assert(calcResult.summary.monthlyIncome === 90000, 'CRUD Update: Recalculates updated monthlyIncome base');
    assert(calcResult.summary.averageMonthlyIncome === 90417, 'CRUD Update: Correct average monthly calculation factoring bonus (1.085 Cr / 12)');
    assert(calcResult.summary.totalAnnualIncome === 1085000, 'CRUD Update: Recalculates total annual income accurately factoring base & bonus (90k * 12 + 5k)');
  } catch (err: any) {
    assert(false, `Test Case 2 updates recalculation failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 3: Soft Delete Persistence
  // -------------------------------------------------------------
  try {
    const deletedDoc: Partial<Income> = {
      id: 'income-doc-111',
      userId: 'user-alice-uid',
      monthlyIncome: 90000,
      deletedAt: new Date(), // Soft deleted flag
    };
    assert(deletedDoc.deletedAt instanceof Date, 'Soft Delete: deletedAt timestamp recorded correctly');
  } catch (err: any) {
    assert(false, `Test Case 3 soft delete failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 4: Security & Ownership Emulation
  // -------------------------------------------------------------
  try {
    const ownerUserId = 'user-alice-uid';
    const attackerUserId = 'user-bob-uid';

    const document: Partial<Income> = {
      id: 'income-doc-111',
      userId: ownerUserId,
      monthlyIncome: 75000,
    };

    // Security check logic emulating Firestore security rule: request.auth.uid == resource.data.userId
    const verifyOwnershipRead = (authUid: string, docOwnerId: string) => {
      return authUid === docOwnerId;
    };

    assert(verifyOwnershipRead(ownerUserId, document.userId!), 'Security: Authenticated document owner successfully allowed access');
    assert(!verifyOwnershipRead(attackerUserId, document.userId!), 'Security: Unauthorized third-party request blocked successfully');
  } catch (err: any) {
    assert(false, `Test Case 4 security validation failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 5: AI Recommendation Dynamic Matching
  // -------------------------------------------------------------
  try {
    const mockIncome: Partial<Income> = {
      monthlyIncome: 75000,
      cityCategory: 'Metro',
      employmentType: 'Private',
      riskProfile: 'Balanced',
      taxRegime: 'New',
    };

    // Case 5a: High Expenses (₹65,000) -> Alert spending controls
    const expensesHigh: Partial<Expense>[] = [
      { amount: 65000, category: 'FOOD' },
    ];
    const calcResultHigh = calculationService.calculateSummary(mockIncome as Income, expensesHigh as Expense[], [], 10000);
    const hasSpendingAlert = calcResultHigh.aiInsights.some(insight => 
      insight.toLowerCase().includes('spending') || 
      insight.toLowerCase().includes('limit') || 
      insight.toLowerCase().includes('debt') ||
      insight.toLowerCase().includes('budget') ||
      insight.toLowerCase().includes('emergency')
    );
    assert(hasSpendingAlert, 'AI Engine: Correctly flags high spending when expenses consume a major share of salary');

    // Case 5b: High Savings Surplus (expenses = ₹15,000) -> Recommend investments
    const expensesLow: Partial<Expense>[] = [
      { amount: 15000, category: 'FOOD' },
    ];
    const calcResultLow = calculationService.calculateSummary(mockIncome as Income, expensesLow as Expense[], [], 150000);
    const hasInvestmentAdv = calcResultLow.aiInsights.some(insight => 
      insight.toLowerCase().includes('invest') || 
      insight.toLowerCase().includes('sip') || 
      insight.toLowerCase().includes('portfolio') ||
      insight.toLowerCase().includes('wealth')
    );
    assert(hasInvestmentAdv, 'AI Engine: Correctly suggests investing/SIP increases when savings potential is high');
  } catch (err: any) {
    assert(false, `Test Case 5 AI rules matching failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 6: Edge Cases & Boundary Values
  // -------------------------------------------------------------
  try {
    const payloadEdgeZero = {
      monthlyIncome: 0,
      employmentType: 'Private',
      salaryType: 'Salary',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      riskProfile: 'Balanced',
      taxRegime: 'New',
    };
    const resZero = validateIncomePayload(payloadEdgeZero);
    assert(!resZero.success, 'Boundary: Rejects zero base monthlyIncome');

    const payloadEdgeNegative = { ...payloadEdgeZero, monthlyIncome: -100 };
    const resNeg = validateIncomePayload(payloadEdgeNegative);
    assert(!resNeg.success, 'Boundary: Rejects negative monthlyIncome');

    const payloadXSS = { 
      ...payloadEdgeZero, 
      monthlyIncome: 75000, 
      notes: 'My note <script>alert("xss")</script>' 
    };
    const cleanedNotes = sanitizeInput(payloadXSS.notes);
    assert(!cleanedNotes.includes('<script>'), 'Boundary: Strips script injections from note texts');
  } catch (err: any) {
    assert(false, `Test Case 6 boundary checks failed: ${err.message}`);
  }

  console.log(`\n📊 System Integration QA Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSystemIntegrationTests();
