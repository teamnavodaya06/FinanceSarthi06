import { validateExpensePayload, sanitizeInput } from '@financesarthi/utils';

async function runTests() {
  console.log('🧪 Starting Expense Validation Engine Unit Tests...');
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

  // 1. Title checks
  const resTitleEmpty = validateExpensePayload({
    title: '',
    amount: 1500,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
  });
  assert(!resTitleEmpty.success, 'Title: Rejects empty title');
  assert(resTitleEmpty.errors.some(e => e.field === 'title'), 'Title: Emits title field error');

  const resTitleShort = validateExpensePayload({
    title: 'A',
    amount: 1500,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
  });
  assert(!resTitleShort.success, 'Title: Rejects short title (<2 chars)');

  // 2. Amount checks
  const resAmtNeg = validateExpensePayload({
    title: 'Swiggy Dinner',
    amount: -150,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
  });
  assert(!resAmtNeg.success, 'Amount: Rejects negative amount');

  const resAmtZero = validateExpensePayload({
    title: 'Swiggy Dinner',
    amount: 0,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
  });
  assert(!resAmtZero.success, 'Amount: Rejects zero amount');

  const resAmtHigh = validateExpensePayload({
    title: 'New Car Pay',
    amount: 2000000, // 20 Lakh (limit is 10 Lakh)
    category: 'DEBT_EMI',
    paymentMethod: 'Bank Transfer',
    date: '2026-08-01',
  });
  assert(!resAmtHigh.success, 'Amount: Rejects excessive amount (>10L)');

  const resAmtNaN = validateExpensePayload({
    title: 'Swiggy Dinner',
    amount: NaN,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
  });
  assert(!resAmtNaN.success, 'Amount: Rejects NaN amount');

  // 3. Category & Subcategory checks
  const resCatBad = validateExpensePayload({
    title: 'Netflix Sub',
    amount: 650,
    category: 'STREAMING_SERVICES',
    paymentMethod: 'Credit Card',
    date: '2026-08-01',
  });
  assert(!resCatBad.success, 'Category: Rejects undefined category tags');

  const resSubBad = validateExpensePayload({
    title: 'Netflix Sub',
    amount: 650,
    category: 'FOOD',
    subcategory: 'OTT Streaming',
    paymentMethod: 'Credit Card',
    date: '2026-08-01',
  });
  assert(!resSubBad.success, 'Subcategory: Rejects subcategory combination mismatch');

  // 4. Payment method checks
  const resPayBad = validateExpensePayload({
    title: 'Netflix Sub',
    amount: 650,
    category: 'ENTERTAINMENT',
    paymentMethod: 'Gold Coins',
    date: '2026-08-01',
  });
  assert(!resPayBad.success, 'Payment: Rejects unsupported payment methods');

  // 5. Date validation
  const resDateBad = validateExpensePayload({
    title: 'Netflix Sub',
    amount: 650,
    category: 'ENTERTAINMENT',
    paymentMethod: 'Credit Card',
    date: '31-02-2026', // Impossible date
  });
  assert(!resDateBad.success, 'Date: Rejects invalid calendar date');

  // 6. XSS Injection
  const dirtyTitle = 'Swiggy <script>alert("xss")</script> Dinner';
  const cleanTitle = sanitizeInput(dirtyTitle);
  assert(!cleanTitle.includes('<script>'), 'XSS: Strips HTML tag injection successfully');

  // 7. Tags validation
  const resTagsBad = validateExpensePayload({
    title: 'Swiggy Dinner',
    amount: 450,
    category: 'FOOD',
    paymentMethod: 'UPI',
    date: '2026-08-01',
    tags: ['food', 'this-is-a-very-long-tag-exceeding-thirty-characters'],
  });
  assert(!resTagsBad.success, 'Tags: Rejects tag length exceeding 30 characters');

  console.log(`\n📊 Expense Validation Engine Test Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
