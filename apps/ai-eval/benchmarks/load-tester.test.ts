import { describe, it, expect } from 'vitest';
import { LoadTester } from './load-tester';

describe('LoadTester Benchmark Suite', () => {
  const loadTester = new LoadTester();

  it('should correctly measure load test metrics for low concurrency (10 users)', async () => {
    const metrics = await loadTester.runSimulation(10);

    expect(metrics.concurrency).toBe(10);
    expect(metrics.failures).toBe(0);
    expect(metrics.averageLatencyMs).toBeGreaterThan(0);
    expect(metrics.p95LatencyMs).toBeGreaterThan(0);
    expect(metrics.simulatedFirestoreReads).toBe(50); // 10 * 5
  });

  it('should compute firestore read scales matching request volume', async () => {
    const metrics = await loadTester.runSimulation(100);

    expect(metrics.concurrency).toBe(100);
    expect(metrics.simulatedFirestoreReads).toBe(500); // 100 * 5
    expect(metrics.failures).toBe(0);
  });

  it('should successfully scale simulations to run multiple suite milestones', async () => {
    const allMetrics = await loadTester.runAllSuites();

    expect(allMetrics.length).toBe(4); // 10, 100, 500, 1000 concurrent requests
    expect(allMetrics[0].concurrency).toBe(10);
    expect(allMetrics[1].concurrency).toBe(100);
    expect(allMetrics[2].concurrency).toBe(500);
    expect(allMetrics[3].concurrency).toBe(1000);
  });
});
