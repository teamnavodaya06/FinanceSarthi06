import { IncomeCalculationService } from '../services/income-calculation.service';
import { Income } from '@prisma/client';

async function runTests() {
  console.log('🧪 Starting Financial Calculations Engine Unit Tests...');
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

  const engine = new IncomeCalculationService();

  // Test 1: Low Income (Rural bracket, base ₹15,000)
  try {
    const mockIncomeLow: Partial<Income> = {
      monthlyIncome: 15000,
      bonusIncome: 0,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      otherIncome: 0,
      cityCategory: 'Rural',
      employmentType: 'Private',
      riskProfile: 'Conservative',
      taxRegime: 'New',
    };

    const res = engine.calculateSummary(mockIncomeLow as Income, [], [], 20000);
    
    assert(res.summary.monthlyIncome === 15000, 'Low Income: Maps monthlyIncome correctly');
    assert(res.summary.annualIncome === 180000, 'Low Income: Calculates annual base correctly (15000 * 12)');
    assert(res.summary.averageMonthlyIncome === 15000, 'Low Income: Average monthly income matches base');
    assert(res.summary.incomeCategory === 'Low Income', 'Low Income: Classifies income level as Low Income');
    assert(res.summary.investmentCapacity === 'High', 'Low Income: Correctly sets capacity based on savings percentage');
    assert(res.healthScore.score > 200, 'Low Income: Generates positive health score');
    assert(res.aiInsights.length >= 2, 'Low Income: Returns at least 2 AI advisory insights');
  } catch (err: any) {
    assert(false, `Test 1 low income threw error: ${err.message}`);
  }

  // Test 2: High Income (Metro bracket, base ₹1,50,000 + freelance ₹30,000)
  try {
    const mockIncomeHigh: Partial<Income> = {
      monthlyIncome: 150000,
      bonusIncome: 0,
      freelanceIncome: 30000,
      rentalIncome: 10000,
      investmentIncome: 5000,
      otherIncome: 5000,
      cityCategory: 'Metro',
      employmentType: 'Private',
      riskProfile: 'Aggressive',
      taxRegime: 'Old',
    };

    const res = engine.calculateSummary(mockIncomeHigh as Income, [], [], 100000);

    assert(res.summary.monthlyIncome === 150000, 'High Income: Maps monthlyIncome correctly');
    assert(res.summary.additionalIncome === 50000, 'High Income: Calculates total additional source sum (30k + 10k + 5k + 5k)');
    assert(res.summary.totalAnnualIncome === 1850000, 'High Income: Total annual (1.5L * 12 + 50k)');
    assert(res.summary.averageMonthlyIncome === 154167, 'High Income: Average monthly (1,850,000 / 12 = 154167)');
    assert(res.summary.incomeCategory === 'High Income', 'High Income: Classifies income level as High Income');
    assert(res.summary.recommendedSip.monthlySip === 30833, 'High Income: Recommended monthly SIP is 20% of average');
    assert(res.summary.recommendedSip.expectedWealth10Years > 5000000, 'High Income: 10-Year compounded SIP value calculates successfully');
  } catch (err: any) {
    assert(false, `Test 2 high income threw error: ${err.message}`);
  }

  // Test 3: Zero / Boundary case checks
  try {
    const mockIncomeZero: Partial<Income> = {
      monthlyIncome: 0,
      bonusIncome: 0,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      otherIncome: 0,
      cityCategory: 'Tier2',
      employmentType: 'Contract',
      riskProfile: 'Balanced',
      taxRegime: 'New',
    };

    const res = engine.calculateSummary(mockIncomeZero as Income, [], [], 0);

    assert(res.summary.monthlyIncome === 0, 'Zero Case: Maps zero income');
    assert(res.summary.totalAnnualIncome === 0, 'Zero Case: Total annual is zero');
    assert(res.summary.recommendedSip.monthlySip === 0, 'Zero Case: SIP recommendation falls to 0');
    assert(res.healthScore.score >= 100, 'Zero Case: Caps health score at minimum boundary (100)');
  } catch (err: any) {
    assert(false, `Test 3 zero income threw error: ${err.message}`);
  }

  console.log(`\n📊 Calculations Engine Test Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
