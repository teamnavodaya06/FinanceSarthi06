import { 
  seasonalBudgetService, 
  budgetHealthService, 
  scenarioSimulationService 
} from '../services/adaptive-budget-engine';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Adaptive AI Budget System Integration QA tests...');

  // Test 1: Seasonal adjustments checks
  console.log(' - Test 1: Verify seasonal offsets mapping...');
  const activeMonthAdjust = seasonalBudgetService.checkSeasonalAdjustments(10); // October (Diwali)
  assert.strictEqual(activeMonthAdjust.hasSeasonalEvent, true, 'October should have seasonal Diwali event');
  assert.strictEqual(activeMonthAdjust.suggestedIncrease, 10000, 'Diwali should recommend ₹10,000 increase');

  const quietMonthAdjust = seasonalBudgetService.checkSeasonalAdjustments(3); // March (Quiet)
  assert.strictEqual(quietMonthAdjust.hasSeasonalEvent, false, 'March should have no seasonal events');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Budget Health Scoring Adherence & EMI load checking
  console.log(' - Test 2: Verify Budget Health Score calculation engine...');
  // spent=15000, total=30000 (50%), emiRatio=0.25 (Good emi load < 40%)
  const health1 = budgetHealthService.calculateBudgetHealthScore(15000, 30000, 0.25);
  assert.ok(health1.score >= 70, 'Health score should be high for good adherence and emi load');
  assert.strictEqual(health1.grade, 'GOOD', 'Grade should match GOOD');

  // spent=35000, total=30000 (Exceeded), emiRatio=0.55 (High emi load > 40%)
  const health2 = budgetHealthService.calculateBudgetHealthScore(35000, 30000, 0.55);
  assert.ok(health2.score < 50, 'Health score should be low for poor adherence and emi load');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Scenario Simulations timelines calculation
  console.log(' - Test 3: Verify Scenario Simulations compound growth projections...');
  const simParams = {
    salary: 80000,
    rent: 18000,
    carPurchaseEmi: 0,
    sipIncrease: 5000,
  };
  const simResult = scenarioSimulationService.runSimulation(simParams);
  assert.strictEqual(simResult.monthlySavings, 57000, 'Savings should match income minus costs');
  assert.strictEqual(simResult.projectedNetWorthYears.length, 5, 'Should project exactly 5 years timeline');
  assert.ok(simResult.projectedNetWorthYears[0].value > 0, 'Year 1 projected value must be positive');
  assert.ok(simResult.projectedNetWorthYears[4].value > simResult.projectedNetWorthYears[0].value, 'Year 5 value must be greater than Year 1');
  console.log('   ✅ Test 3 Passed.');

  console.log('✨ All Adaptive AI Budget System Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
