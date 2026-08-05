import { describe, it, expect } from 'vitest';
import { EvaluationEngine } from './evaluation-engine';
import { TEST_PROFILES } from '../fixtures/profiles';

describe('EvaluationEngine Unit Tests', () => {
  const engine = new EvaluationEngine();

  it('should correctly calculate latency scores based on response time thresholds', () => {
    // Latency < 400ms -> Score 100
    expect(engine['calculateLatencyScore'](50)).toBe(100);
    expect(engine['calculateLatencyScore'](200)).toBe(100);

    // Latency < 1000ms -> Score 90
    expect(engine['calculateLatencyScore'](800)).toBe(90);

    // Latency < 2000ms -> Score 80
    expect(engine['calculateLatencyScore'](1500)).toBe(80);

    // Latency < 4000ms -> Score 50
    expect(engine['calculateLatencyScore'](3000)).toBe(50);

    // Latency >= 4000ms -> Score 0
    expect(engine['calculateLatencyScore'](5000)).toBe(0);
  });

  it('should evaluate safety constraints for a given profile', async () => {
    const studentProfile = TEST_PROFILES.student;
    const result = await engine.evaluateSafety(studentProfile);

    expect(result.category).toBe('SAFETY');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it('should evaluate prompt injection defenses', async () => {
    const ypProfile = TEST_PROFILES.young_professional;
    const result = await engine.evaluatePromptInjection(ypProfile);

    expect(result.category).toBe('PROMPT_INJECTION');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it('should run the entire suite and aggregate scores into FinalScorecard format', async () => {
    const scorecard = await engine.runSuite();

    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
    expect(scorecard.relevanceScore).toBe(100);
    expect(scorecard.safetyScore).toBe(100);
    expect(scorecard.securityScore).toBe(100);
    expect(scorecard.details.length).toBeGreaterThan(0);
  }, 30000);
});
