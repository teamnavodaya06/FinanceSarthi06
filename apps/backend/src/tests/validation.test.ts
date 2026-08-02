import { validateIncomePayload, sanitizeInput } from '@financesarthi/utils';

async function runTests() {
  console.log('🧪 Starting Multi-Layer Validation Engine Unit Tests...');
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

  // 1. Sanitization Checks
  const dirtyNote = 'My Salary <script>alert("xss")</script> <b>Bonus</b>';
  const cleanNote = sanitizeInput(dirtyNote);
  assert(!cleanNote.includes('<script>'), 'Sanitization: Strips script tags successfully');
  assert(!cleanNote.includes('<b>'), 'Sanitization: Strips HTML tags successfully');
  assert(cleanNote.includes('My Salary'), 'Sanitization: Preserves normal text contents');

  // 2. Empty / Null Monthly Income
  const payloadEmpty = {
    monthlyIncome: null,
    employmentType: 'Private',
    salaryType: 'Salary',
    incomeFrequency: 'Monthly',
    cityCategory: 'Tier2',
    riskProfile: 'Balanced',
    taxRegime: 'New',
  };
  const resEmpty = validateIncomePayload(payloadEmpty);
  assert(!resEmpty.success, 'Validation: Rejects null monthly income');
  assert(resEmpty.errors.some(e => e.field === 'monthlyIncome'), 'Validation: Outputs monthlyIncome field error');

  // 3. Negative Monthly Income
  const payloadNeg = { ...payloadEmpty, monthlyIncome: -500 };
  const resNeg = validateIncomePayload(payloadNeg);
  assert(!resNeg.success, 'Validation: Rejects negative monthly income');
  assert(resNeg.errors.some(e => e.message.includes('negative')), 'Validation: Returns negative monthly income error msg');

  // 4. Zero Monthly Income
  const payloadZero = { ...payloadEmpty, monthlyIncome: 0 };
  const resZero = validateIncomePayload(payloadZero);
  assert(!resZero.success, 'Validation: Rejects zero monthly income');

  // 5. High Cap Income (> 10 Crore)
  const payloadHigh = { ...payloadEmpty, monthlyIncome: 110000000 };
  const resHigh = validateIncomePayload(payloadHigh);
  assert(!resHigh.success, 'Validation: Rejects income exceeding ₹10 Crore');
  assert(resHigh.errors.some(e => e.message.includes('exceed')), 'Validation: Emits maximum salary cap exceeded error');

  // 6. NaN / Infinity Income
  const payloadNaN = { ...payloadEmpty, monthlyIncome: NaN };
  const resNaN = validateIncomePayload(payloadNaN);
  assert(!resNaN.success, 'Validation: Rejects NaN monthly income');

  const payloadInf = { ...payloadEmpty, monthlyIncome: Infinity };
  const resInf = validateIncomePayload(payloadInf);
  assert(!resInf.success, 'Validation: Rejects Infinity monthly income');

  // 7. Invalid Employment
  const payloadJob = { ...payloadEmpty, monthlyIncome: 75000, employmentType: 'Witch Doctor' };
  const resJob = validateIncomePayload(payloadJob);
  assert(!resJob.success, 'Validation: Rejects invalid employment types');

  // 8. Invalid Regime
  const payloadTax = { ...payloadEmpty, monthlyIncome: 75000, taxRegime: 'MiddleAge' };
  const resTax = validateIncomePayload(payloadTax);
  assert(!resTax.success, 'Validation: Rejects invalid tax regimes');

  // 9. Invalid Goals
  const payloadGoals = {
    ...payloadEmpty,
    monthlyIncome: 75000,
    financialPriority: ['Retirement', 'Buying a Spacecraft'],
  };
  const resGoals = validateIncomePayload(payloadGoals);
  assert(!resGoals.success, 'Validation: Rejects invalid goal lists');

  console.log(`\n📊 Validation Engine Test Summary:`);
  console.log(` - Passed: ${passedCount}`);
  console.log(` - Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
