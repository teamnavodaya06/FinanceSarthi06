import { TEST_PROFILES } from '../fixtures/profiles';
import { geminiMockClient } from '../mocks/gemini-mock';

export interface LoadTestMetrics {
  concurrency: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  failures: number;
  memoryUsageMb: number;
  cpuPercentage: number;
  simulatedFirestoreReads: number;
}

export class LoadTester {
  private getCPUUsage(): number {
    const startUsage = process.cpuUsage();
    // Busy wait simulation or approximation for CPU usage
    const now = Date.now();
    while (Date.now() - now < 5) {} // 5ms block
    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;
    return Math.min(100, Math.round(totalUsage / 1000));
  }

  async runSimulation(concurrency: number): Promise<LoadTestMetrics> {
    const profiles = Object.values(TEST_PROFILES);
    const promises: Promise<{ latency: number; success: boolean }>[] = [];
    
    const startTime = Date.now();

    for (let i = 0; i < concurrency; i++) {
      const profile = profiles[i % profiles.length];
      const executeRequest = async () => {
        const startReq = Date.now();
        try {
          // Adjust mock latency according to load density to simulate server bottlenecks
          const loadMultiplier = Math.max(1, concurrency / 100);
          geminiMockClient.setLatency(Math.round(150 * loadMultiplier));
          
          await geminiMockClient.generateResponse("My food spending feels high.", profile);
          return { latency: Date.now() - startReq, success: true };
        } catch {
          return { latency: Date.now() - startReq, success: false };
        }
      };
      promises.push(executeRequest());
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const latencies = results.filter(r => r.success).map(r => r.latency).sort((a, b) => a - b);
    const failures = results.filter(r => !r.success).length;

    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((sum, l) => sum + l, 0) / latencies.length)
      : 0;

    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies.length > 0 ? latencies[p95Index] : 0;

    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const cpuPercentage = this.getCPUUsage();

    // Estimate Firestore reads:
    // Fetching dashboard context (income, expense, goals, assets, liabilities) 
    // requires reading ~5 collections per request.
    const simulatedFirestoreReads = concurrency * 5;

    // Reset mock client latency
    geminiMockClient.setLatency(200);

    return {
      concurrency,
      averageLatencyMs: avgLatency,
      p95LatencyMs: p95Latency,
      failures,
      memoryUsageMb: memoryUsage,
      cpuPercentage,
      simulatedFirestoreReads
    };
  }

  async runAllSuites(): Promise<LoadTestMetrics[]> {
    const suites = [10, 100, 500, 1000];
    const metrics: LoadTestMetrics[] = [];
    
    for (const c of suites) {
      metrics.push(await this.runSimulation(c));
    }

    return metrics;
  }
}
