export type AppEvent =
  | 'IncomeUpdated'
  | 'ExpenseCreated'
  | 'ExpenseUpdated'
  | 'ExpenseDeleted'
  | 'GoalCreated'
  | 'GoalUpdated'
  | 'GoalCompleted'
  | 'BudgetChanged'
  | 'InvestmentUpdated'
  | 'LoanUpdated'
  | 'EmergencyFundUpdated'
  | 'DashboardRefreshRequested'
  | 'AIContextUpdated';

class FinancialEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  subscribe(event: AppEvent, callback: Function): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  emit(event: AppEvent, payload?: any) {
    if (this.listeners[event]) {
      // Execute callbacks safely
      this.listeners[event].forEach((callback) => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error in subscriber of event: ${event}`, err);
        }
      });
    }
  }
}

export const financialEvents = new FinancialEventEmitter();
export default financialEvents;
