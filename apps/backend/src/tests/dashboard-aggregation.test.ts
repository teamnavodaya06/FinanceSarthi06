import { 
  IncomeAggregator, 
  ExpenseAggregator, 
  BudgetAggregator, 
  CashFlowAggregator, 
  GoalAggregator, 
  InvestmentAggregator, 
  NetWorthAggregator, 
  ChartAggregator,
  dashboardAggregationService
} from '../services/dashboard-aggregation.service';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Dashboard Aggregation API Integration QA tests...');

  // Test 1: Income Aggregator
  console.log(' - Test 1: Verify Income Aggregator...');
  const incomesList = [
    { amount: 80000, source: 'Salary' },
    { amount: 15000, source: 'Freelance' }
  ];
  const incRes = IncomeAggregator.aggregate(incomesList, 75000);
  assert.strictEqual(incRes.monthlyIncome, 95000, 'Income sum matches');
  assert.strictEqual(incRes.annualIncome, 95000 * 12, 'Annual income matches');
  assert.deepStrictEqual(incRes.sources.sort(), ['Freelance', 'Salary'], 'Sources match');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Expense Aggregator
  console.log(' - Test 2: Verify Expense Aggregator...');
  const now = new Date();
  const expensesList = [
    { amount: 5000, date: now, merchant: 'Amazon', category: 'SHOPPING' },
    { amount: 2000, date: now, merchant: 'Uber', category: 'TRANSPORT' },
    { amount: 800, date: new Date(2025, 0, 1), merchant: 'Swiggy', category: 'FOOD' } // Past month
  ];
  const expRes = ExpenseAggregator.aggregate(expensesList);
  assert.strictEqual(expRes.todaySpending, 7000, 'Today spending sum matches');
  assert.strictEqual(expRes.monthlySpending, 7000, 'Current month spending matches');
  assert.strictEqual(expRes.largestExpense, 5000, 'Largest expense matches');
  assert.strictEqual(expRes.topMerchants.length > 0, true, 'Top merchants found');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Net Worth Aggregator
  console.log(' - Test 3: Verify Net Worth Aggregator...');
  const assets = [
    { category: 'Mutual Funds', value: 300000, name: 'HDFC Fund' },
    { category: 'Gold', value: 50000, name: 'SGB' }
  ];
  const liabilities = [
    { remaining: 80000, monthlyEmi: 5000 },
    { remaining: 20000, monthlyEmi: 2000 }
  ];
  const nwRes = NetWorthAggregator.aggregate(assets, liabilities);
  assert.strictEqual(nwRes.assets, 350000, 'Total assets sum matches');
  assert.strictEqual(nwRes.liabilities, 100000, 'Total liabilities sum matches');
  assert.strictEqual(nwRes.netWorth, 250000, 'Net Worth matches assets minus liabilities');
  console.log('   ✅ Test 3 Passed.');

  // Test 4: Goal Aggregator
  console.log(' - Test 4: Verify Goal Aggregator...');
  const goals = [
    { id: 'goal-1', title: 'Car Downpayment', category: 'VEHICLE', targetAmount: 200000, currentAmount: 50000, monthlyAllocation: 10000 }
  ];
  const goalRes = GoalAggregator.aggregate(goals);
  assert.strictEqual(goalRes[0].remainingAmount, 150000, 'Remaining goals targets correct');
  assert.strictEqual(goalRes[0].completionPercentage, 25, 'Completion progress matches');
  assert.strictEqual(goalRes[0].estimatedCompletionDate !== 'TBD', true, 'Completion target date estimated');
  console.log('   ✅ Test 4 Passed.');

  console.log('✨ All Dashboard Aggregation API Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
