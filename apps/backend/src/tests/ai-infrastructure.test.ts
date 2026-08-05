import { aiConfigurationService } from '../services/ai/AIConfigurationService';
import { tokenManagementService } from '../services/ai/TokenManagementService';
import { aiContextBuilder } from '../services/ai/AIContextBuilder';
import { promptBuilderService } from '../services/ai/PromptBuilderService';
import { aiOrchestrator } from '../services/ai/AIOrchestrator';
import * as assert from 'assert';

async function runTests() {
  console.log('🧪 Starting AI Infrastructure Layer Integration QA tests...');

  // Test 1: AI Configs service settings
  console.log(' - Test 1: Verify Configuration update parameters...');
  const initial = aiConfigurationService.getModelConfig();
  assert.strictEqual(initial.modelName, 'gemini-2.5-pro', 'Default model is gemini-2.5-pro');
  
  aiConfigurationService.updateConfig({ modelName: 'gemini-1.5-flash', temperature: 0.5 });
  const updated = aiConfigurationService.getModelConfig();
  assert.strictEqual(updated.modelName, 'gemini-1.5-flash', 'Model updated');
  assert.strictEqual(updated.temperature, 0.5, 'Temperature updated');
  console.log('   ✅ Test 1 Passed.');

  // Test 2: Cost Calculation metrics
  console.log(' - Test 2: Verify Token estimation and cost tracking...');
  const textPrompt = 'Analyze my monthly utility spend and suggest an optimization plan.';
  const textResponse = 'Your utility spending is stable at ₹4,000. Reallocate surplus cash.';
  const metrics = tokenManagementService.calculateMetrics(textPrompt, textResponse);

  assert.strictEqual(metrics.promptTokens > 0, true, 'Prompt tokens count > 0');
  assert.strictEqual(metrics.responseTokens > 0, true, 'Response tokens count > 0');
  assert.strictEqual(metrics.estimatedCostUsd > 0, true, 'Estimated cost > $0');
  console.log('   ✅ Test 2 Passed.');

  // Test 3: Prompt Builder structural mapping
  console.log(' - Test 3: Verify system instructions formatting in PromptBuilder...');
  const prompt = promptBuilderService.buildSystemPrompt('Mock Context', 'Mock History', 'Mock User Message');
  assert.strictEqual(prompt.includes('AI Sarthi'), true, 'System persona included');
  assert.strictEqual(prompt.includes('Mock Context'), true, 'Financial facts injected');
  assert.strictEqual(prompt.includes('Mock User Message'), true, 'User query injected');
  console.log('   ✅ Test 3 Passed.');

  console.log('✨ All AI Infrastructure Layer Integration QA tests completed successfully!');
}

runTests().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
