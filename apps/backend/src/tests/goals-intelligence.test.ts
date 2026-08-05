import { goalExtendedRepository } from '../repositories/goal-extended.repository';
import { goalForecastService } from '../services/goals/GoalForecastService';
import { goalAnalyticsService } from '../services/goals/GoalAnalyticsService';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Goal Intelligence Engine Integration QA tests...');

  const testUserId = 'test-qa-user-id';

  // Test 1: Verify Goal Creation & Mapping
  console.log(' - Test 1: Create goal and verify output key mappings...');
  const newGoal = await goalExtendedRepository.create(testUserId, {
    goalName: 'Home Down Payment',
    goalType: 'HOME_PURCHASE',
    targetAmount: 500000,
    currentAmount: 100000,
    monthlyContribution: 5000,
    targetDate: '2029-12-01'
  });

  assert.strictEqual(newGoal.userId, testUserId, 'Correct userId');
  assert.strictEqual(newGoal.goalName, 'Home Down Payment', 'Mapped goalName');
  assert.strictEqual(newGoal.goalType, 'HOME_PURCHASE', 'Mapped goalType');
  assert.strictEqual(newGoal.remainingAmount, 400000, 'Calculates remainingAmount');
  assert.strictEqual(newGoal.completionPercentage, 20, 'Calculates completion percentage');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Verify Timeline Forecasting & Simulations
  console.log(' - Test 2: Verify Forecast calculations...');
  const forecast = await goalForecastService.getForecastForGoal(newGoal.goalId);
  assert.ok(forecast, 'Forecast returned');
  assert.strictEqual(forecast.probability, 45, 'Estimates correct probability based on rate');

  const simulation = await goalForecastService.simulateDoubleContribution(newGoal.goalId);
  assert.ok(simulation, 'Simulation returned');
  assert.strictEqual(simulation.timelineImprovementMonths, 40, 'Calculates timeline improvements correctly');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Verify Analytics Division compilations
  console.log(' - Test 3: Verify Analytics Aggregation outputs...');
  const analytics = await goalAnalyticsService.getAnalytics(testUserId);
  assert.ok(analytics.totalGoals >= 1, 'Total goals parsed');
  assert.ok(analytics.averageCompletionRate > 0, 'Average completion rate calculated');
  console.log('   ✅ Test 3 Passed.');

  console.log('✨ All Goal Intelligence Engine Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
