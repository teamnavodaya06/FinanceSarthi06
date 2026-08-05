import { requestValidator } from '../services/ai/reliability/RequestValidator';
import { responseValidator } from '../services/ai/reliability/ResponseValidator';
import { circuitBreaker } from '../services/ai/reliability/CircuitBreaker';
import { fallbackEngine } from '../services/ai/reliability/FallbackEngine';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting AI Reliability Layer Integration QA tests...');

  // Test 1: Request Validations bounds check
  console.log(' - Test 1: Verify RequestValidator input constraints...');
  assert.throws(() => requestValidator.validateRequest('', 'Review budget'), /Authentication required/, 'Rejects empty userId');
  assert.throws(() => requestValidator.validateRequest('user-1', ''), /Prompt content cannot be empty/, 'Rejects empty prompts');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Response Validations keywords check
  console.log(' - Test 2: Verify ResponseValidator outcomes constraints...');
  assert.throws(() => responseValidator.validateResponse(''), /Malformed response is empty/, 'Rejects empty response string');
  assert.throws(() => responseValidator.validateResponse('Error: 500 INTERNAL SERVER ERROR'), /Systemic failure keyword detected/, 'Rejects systemic errors');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Circuit Breaker Transitions check
  console.log(' - Test 3: Verify CircuitBreaker state changes...');
  circuitBreaker.forceClose();
  assert.strictEqual(circuitBreaker.checkState(), 'CLOSED', 'Initially CLOSED');

  // Trigger consecutive failures to trip circuit
  circuitBreaker.recordFailure();
  circuitBreaker.recordFailure();
  circuitBreaker.recordFailure();
  assert.strictEqual(circuitBreaker.checkState(), 'OPEN', 'Breaker trips to OPEN after 3 failures');
  console.log('   ✅ Test 3 Passed.');

  // Test 4: Fallback Engine outputs compile check
  console.log(' - Test 4: Verify FallbackEngine default structures...');
  const fallback = fallbackEngine.generateFallback('Review my dining spending');
  assert.strictEqual(fallback.isFallback, true, 'Returns isFallback flag true');
  assert.strictEqual(fallback.widgetData.type, 'EXPENSE_BREAKDOWN', 'Returns contextual breakdown widgets');
  console.log('   ✅ Test 4 Passed.');

  console.log('✨ All AI Reliability Layer Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
