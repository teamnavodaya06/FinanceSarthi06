import { goalProgressService } from '../services/goals/GoalProgressService';
import { goalHealthService } from '../services/goals/GoalHealthService';
import { goalMilestoneService } from '../services/goals/GoalMilestoneService';
import { goalExtendedRepository } from '../repositories/goal-extended.repository';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Goal Progress Tracking Integration QA tests...');

  const testUserId = 'test-qa-user-id';

  // Seed goal profile
  const goal = await goalExtendedRepository.create(testUserId, {
    goalName: 'Vacation Trip Fund',
    goalType: 'VACATION',
    targetAmount: 200000,
    currentAmount: 100000,
    monthlyContribution: 10000,
    targetDate: '2027-01-01'
  });

  // Test 1: Verify GoalProgressService calculations
  console.log(' - Test 1: Verify GoalProgressService velocities and remaining days...');
  const progress = await goalProgressService.getProgressForGoal(goal.goalId);
  assert.ok(progress, 'Progress compiled successfully');
  assert.strictEqual(progress.remainingAmount, 100000, 'Calculates remainingAmount');
  assert.strictEqual(progress.velocity.weeklyProgress, Math.round(10000 / 4.3), 'Calculates weekly velocity');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Verify GoalHealthService scores
  console.log(' - Test 2: Verify GoalHealthService scoring equations...');
  const health = await goalHealthService.getHealthForGoal(goal.goalId);
  assert.ok(health, 'Health compiled successfully');
  assert.ok(health.score >= 50 && health.score <= 100, 'Calculates score in range 0-100');
  assert.strictEqual(health.rating, 'Good', 'Classifies correct Good health rating');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Verify GoalMilestoneService list
  console.log(' - Test 3: Verify GoalMilestoneService achieved threshold states...');
  const milestones = await goalMilestoneService.getMilestonesForGoal(goal.goalId);
  assert.strictEqual(milestones.length, 6, 'Contains 6 milestone targets');
  // Since progress percentage is 50%, thresholds 10%, 25%, 50% must be achieved, others false
  const achievedPct = milestones.filter(m => m.achieved).map(m => m.percentage);
  assert.deepStrictEqual(achievedPct, [10, 25, 50], 'Milestones up to 50% are checked achieved');
  console.log('   ✅ Test 3 Passed.');

  console.log('✨ All Goal Progress Tracking Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
