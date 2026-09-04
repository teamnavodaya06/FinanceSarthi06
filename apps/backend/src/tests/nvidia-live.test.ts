import { nvidiaService } from '../services/ai/NvidiaService';
import { aiOrchestrator } from '../services/ai/AIOrchestrator';
import { aiConfigurationService } from '../services/ai/AIConfigurationService';
import * as assert from 'assert';

async function testNvidiaIntegration() {
  console.log('🧪 Starting NVIDIA Nemotron API Integration Verification Test...\n');

  // Test 1: Directly test NvidiaService
  console.log('1️⃣  Testing direct execution via NvidiaService...');
  const prompt = 'Explain 3 key tax saving tips under Indian Income Tax for a salaried individual earning ₹10 Lakhs/year.';
  console.log(`Prompt: "${prompt}"`);
  
  const startTime = Date.now();
  const result = await nvidiaService.executeWithRetry(prompt, 2);
  const elapsed = Date.now() - startTime;

  console.log(`\n✅ Direct NVIDIA Nemotron Response Received (${elapsed}ms):`);
  console.log('----------------------------------------------------');
  console.log(result.substring(0, 400) + '...\n');
  assert.ok(result.length > 50, 'NVIDIA API returned valid non-empty string');

  // Test 2: AIOrchestrator routing via provider configuration
  console.log('2️⃣  Testing AIOrchestrator with active NVIDIA provider...');
  aiConfigurationService.setProvider('nvidia');
  
  const orchResult = await aiOrchestrator.processRequest(
    'user-test-123',
    'How much emergency fund should I keep if my monthly expenses are ₹40,000?',
    '',
    'English'
  );

  console.log('\n✅ AIOrchestrator Processed Response:');
  console.log('----------------------------------------------------');
  console.log(orchResult.text.substring(0, 400) + '...\n');
  assert.ok(!orchResult.isFallback, 'Request was handled by primary AI without falling back to rule engine');

  console.log('🎉 All NVIDIA Nemotron API tests passed successfully!');
}

testNvidiaIntegration().catch(err => {
  console.error('❌ NVIDIA API Test failed:', err);
  process.exit(1);
});
