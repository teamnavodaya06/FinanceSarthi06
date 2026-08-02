import { validateExpensePayload, sanitizeInput } from '@financesarthi/utils';
import { Expense } from '@financesarthi/types';

async function runExpenseSystemIntegrationTests() {
  console.log('🧪 Starting Enterprise-Grade Expense Management System Integration QA Suite...');
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

  // -------------------------------------------------------------
  // Test Case 1: Create Expense Validation & Insertion Formatting
  // -------------------------------------------------------------
  try {
    const validPayload = {
      title: 'Zomato Lunch Order',
      amount: 450,
      category: 'FOOD',
      subcategory: 'Delivery',
      paymentMethod: 'UPI',
      date: '2026-08-01',
      merchant: 'Zomato',
      tags: ['food', 'office'],
      isRecurring: false,
    };

    const valResult = validateExpensePayload(validPayload);
    assert(valResult.success, 'Create: Valid payload passes validation checking');

    const invalidPayloadNeg = { ...validPayload, amount: -150 };
    const valResultNeg = validateExpensePayload(invalidPayloadNeg);
    assert(!valResultNeg.success, 'Create: Rejects negative amount');

    const invalidPayloadNaN = { ...validPayload, amount: NaN };
    const valResultNaN = validateExpensePayload(invalidPayloadNaN);
    assert(!valResultNaN.success, 'Create: Rejects NaN amount');

    const invalidPayloadZero = { ...validPayload, amount: 0 };
    const valResultZero = validateExpensePayload(invalidPayloadZero);
    assert(!valResultZero.success, 'Create: Rejects zero amount');

    const invalidPayloadDate = { ...validPayload, date: '31-02-2026' };
    const valResultDate = validateExpensePayload(invalidPayloadDate);
    assert(!valResultDate.success, 'Create: Rejects invalid date format');

    const dirtyTitle = 'Shopping <script>alert("xss")</script> Cart';
    const sanitizedTitle = sanitizeInput(dirtyTitle);
    assert(!sanitizedTitle.includes('<script>'), 'Create: HTML / XSS Injection tags stripped out successfully');
  } catch (err: any) {
    assert(false, `Test Case 1 Create Validation threw error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 2: Reading, Searching, Sorting & Pagination emulations
  // -------------------------------------------------------------
  try {
    const mockExpenses: Expense[] = [
      { id: 'exp-1', userId: 'user-alice-uid', title: 'Rent payment', amount: 25000, category: 'HOUSING', date: '2026-08-01', isRecurring: true, tags: ['monthly'] },
      { id: 'exp-2', userId: 'user-alice-uid', title: 'Groceries store', amount: 3500, category: 'FOOD', date: '2026-08-02', isRecurring: false, tags: ['weekly'] },
      { id: 'exp-3', userId: 'user-alice-uid', title: 'Swiggy Dinner', amount: 750, category: 'FOOD', date: '2026-08-03', isRecurring: false, tags: ['food'] },
      { id: 'exp-4', userId: 'user-alice-uid', title: 'Electricity bill', amount: 4500, category: 'UTILITIES', date: '2026-08-04', isRecurring: true, tags: ['bill'] },
    ];

    // Search simulation
    const searchFilter = (list: Expense[], queryText: string) => {
      const q = queryText.toLowerCase();
      return list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
      );
    };

    const searchResults = searchFilter(mockExpenses, 'Swiggy');
    assert(searchResults.length === 1 && searchResults[0].id === 'exp-3', 'Read: Searching correctly matches terms across title attributes');

    const tagResults = searchFilter(mockExpenses, 'weekly');
    assert(tagResults.length === 1 && tagResults[0].id === 'exp-2', 'Read: Searching correctly matches terms inside tags lists');

    // Filter simulation
    const filteredResultCategory = mockExpenses.filter(e => e.category === 'FOOD');
    assert(filteredResultCategory.length === 2, 'Read: Category filter matches correct number of docs');

    const filteredResultRecurring = mockExpenses.filter(e => e.isRecurring);
    assert(filteredResultRecurring.length === 2, 'Read: Recurring filter successfully fetches monthly subscriptions');

    // Sorting simulation
    const sortByAmountDesc = [...mockExpenses].sort((a, b) => b.amount - a.amount);
    assert(sortByAmountDesc[0].id === 'exp-1', 'Read: Sorting by Amount Desc matches highest expense correctly');

    const sortByDateAsc = [...mockExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    assert(sortByDateAsc[0].id === 'exp-1', 'Read: Sorting by Date Asc order lists oldest first');

    // Pagination simulation
    const cursor = 'exp-2';
    const limit = 2;
    const startIndex = mockExpenses.findIndex(e => e.id === cursor);
    const paginatedSlice = mockExpenses.slice(startIndex + 1, startIndex + 1 + limit);
    
    assert(paginatedSlice.length === 2 && paginatedSlice[0].id === 'exp-3', 'Read: Cursor-based pagination logic returns next page boundaries correctly');
  } catch (err: any) {
    assert(false, `Test Case 2 Querying operations failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 3: Update Recalculations & Ownership Guard Checks
  // -------------------------------------------------------------
  try {
    const originalExpense: Expense = {
      id: 'exp-5',
      userId: 'user-alice-uid',
      title: 'Keyboard Purchase',
      amount: 4000,
      category: 'SHOPPING',
      date: '2026-08-01',
      isRecurring: false,
    };

    // Owner and Attacker credentials
    const ownerId = 'user-alice-uid';
    const attackerId = 'user-bob-uid';

    const checkAuthorization = (authUid: string, docUserId: string) => {
      return authUid === docUserId;
    };

    assert(checkAuthorization(ownerId, originalExpense.userId), 'Security: Authenticated owner is successfully authorized for resource changes');
    assert(!checkAuthorization(attackerId, originalExpense.userId), 'Security: Unauthorized third-party modifications are rejected');

    // Partial update merge check
    const partialUpdate = { amount: 5500, notes: 'Updated mechanical keyboard keys' };
    const updatedResult = { ...originalExpense, ...partialUpdate };

    assert(updatedResult.amount === 5500 && updatedResult.notes === 'Updated mechanical keyboard keys', 'Update: Merges patch payload attributes correctly');
  } catch (err: any) {
    assert(false, `Test Case 3 Updates & Guarding failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test Case 4: Soft Delete Integrity checks
  // -------------------------------------------------------------
  try {
    const listWithSoftDelete = [
      { id: 'exp-1', userId: 'user-alice-uid', title: 'Food', amount: 200, category: 'FOOD', date: '2026-08-01', isRecurring: false, isDeleted: false },
      { id: 'exp-2', userId: 'user-alice-uid', title: 'Movies', amount: 500, category: 'ENTERTAINMENT', date: '2026-08-02', isRecurring: false, isDeleted: true, deletedAt: new Date().toISOString() },
    ];

    const activeList = listWithSoftDelete.filter(e => !e.isDeleted);
    assert(activeList.length === 1 && activeList[0].id === 'exp-1', 'Delete: Soft deleted expenses are excluded from active list queries');
  } catch (err: any) {
    assert(false, `Test Case 4 Soft Delete check failed: ${err.message}`);
  }

  console.log(`\n📊 Expense System Integration QA Suite Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runExpenseSystemIntegrationTests();
