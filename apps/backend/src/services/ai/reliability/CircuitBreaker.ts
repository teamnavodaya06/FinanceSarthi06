export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private consecutiveFailures = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 3; // Trip after 3 consecutive failures
  private readonly cooldownPeriodMs = 60000; // 60 seconds cooldown window

  checkState(): 'CLOSED' | 'OPEN' | 'HALF-OPEN' {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF-OPEN';
        console.log('[CIRCUIT BREAKER] Cooling down: State transitioning to HALF-OPEN.');
      }
    }
    return this.state;
  }

  recordSuccess() {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();
    
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`[CIRCUIT BREAKER] Tripped: Exceeded failure threshold of ${this.failureThreshold}. State is now OPEN.`);
    }
  }

  forceOpen() {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
  }

  forceClose() {
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
  }
}
export const circuitBreaker = new CircuitBreaker();
