import { budgetCalculationService, budgetPredictionService, budgetRecommendationService } from '../services/budget.service';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Monthly Budget System Integration QA tests...');

  // Test 1: Calculate metrics and check status labels
  console.log(' - Test 1: Verify status labels based on percentage metrics...');
  const safeMetrics = budgetCalculationService.constructor as any; // static class helpers
  const status1 = budgetCalculationService.constructor.prototype.constructor.getStatusForPercentage(45);
  assert.strictEqual(status1, 'SAFE', 'Percentage 45 must be SAFE');

  const status2 = budgetCalculationService.constructor.prototype.constructor.getStatusForPercentage(65);
  assert.strictEqual(status2, 'HEALTHY', 'Percentage 65 must be HEALTHY');

  const status3 = budgetCalculationService.constructor.prototype.constructor.getStatusForPercentage(80);
  assert.strictEqual(status3, 'WARNING', 'Percentage 80 must be WARNING');

  const status4 = budgetCalculationService.constructor.prototype.constructor.getStatusForPercentage(95);
  assert.strictEqual(status4, 'CRITICAL', 'Percentage 95 must be CRITICAL');

  const status5 = budgetCalculationService.constructor.prototype.constructor.getStatusForPercentage(110);
  assert.strictEqual(status5, 'EXCEEDED', 'Percentage 110 must be EXCEEDED');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Month-End Predictions calculations
  console.log(' - Test 2: Verify Month-End Prediction engine outputs...');
  // spent=15000, total=30000, month=8, year=2026 (August has 31 days)
  // Let's mock a scenario with current date set as mid-month (day 15)
  const predictions = budgetPredictionService.constructor.prototype.constructor.getPredictions(15000, 30000, 8, 2026);
  assert.ok(predictions.projectedSpending > 0, 'Projected spending must be greater than 0');
  assert.ok(predictions.burnRate > 0, 'Burn rate must be greater than 0');
  assert.strictEqual(predictions.overspendingProbability > 0, true, 'Probability calculation must trigger');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: AI Advisor Recommendations rules
  console.log(' - Test 3: Verify AI recommendations generator...');
  const categoryBudgets = [
    { categoryId: 'food-dining', allocated: 10000, spent: 12000 },
  ];
  const recs = budgetRecommendationService.constructor.prototype.constructor.generateRecommendations(25000, 20000, categoryBudgets);
  assert.strictEqual(recs.length, 2, 'Should generate recommendations for both overall and category overruns');
  assert.strictEqual(recs[0].priority, 'HIGH', 'Overall overrun should be HIGH priority');
  assert.strictEqual(recs[1].priority, 'MEDIUM', 'Category overrun should be MEDIUM priority');
  console.log('   ✅ Test 3 Passed.');

  console.log('✨ All Monthly Budget System Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
