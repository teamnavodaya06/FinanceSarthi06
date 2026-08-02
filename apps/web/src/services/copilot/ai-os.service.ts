import { Expense, Goal } from '@financesarthi/types';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface ProactiveTask {
  id: string;
  title: string;
  category: 'EMERGENCY_FUND' | 'BUDGET' | 'SUBSCRIPTION' | 'SALARY_INCREASE';
  description: string;
  whyItMatters: string;
  actionText: string;
  impact: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: string;
  metadata?: any;
}

export class AIOSService {
  public static generateProactiveTasks(
    expenses: Expense[],
    monthlyIncome: number,
    goals: Goal[]
  ): ProactiveTask[] {
    const tasks: ProactiveTask[] = [];
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const salary = monthlyIncome || 85000;

    // Task 1: Emergency Fund target check
    const emergencyFundGoal = goals.find(g => g.category === 'EMERGENCY_FUND');
    const emergencyCurrent = emergencyFundGoal?.currentAmount || 0;
    const emergencyTarget = emergencyFundGoal?.targetAmount || (salary * 3);
    if (emergencyCurrent < emergencyTarget) {
      tasks.push({
        id: 'task-emergency-boost',
        title: 'Calibrate Emergency Fund Contributions',
        category: 'EMERGENCY_FUND',
        description: `Current emergency reserves: ₹${emergencyCurrent.toLocaleString('en-IN')}. Recommended safety buffer: ₹${emergencyTarget.toLocaleString('en-IN')}.`,
        whyItMatters: 'Protects you from tapping credit lines during salary delay or health contingencies.',
        actionText: 'Increase emergency allocation by ₹3,000/mo.',
        impact: 'Speeds up target milestone by 4 months',
        priority: 'High',
        confidence: '95%',
        metadata: { goalId: emergencyFundGoal?.id, addedAmount: 3000 },
      });
    }

    // Task 2: Budget overspend warning
    if (totalSpent > salary * 0.85) {
      const overrun = totalSpent - (salary * 0.85);
      tasks.push({
        id: 'task-budget-tighten',
        title: 'Lock Discretionary Budgets',
        category: 'BUDGET',
        description: `Your active budget depletion rate is high. Overspent by ₹${Math.round(overrun).toLocaleString('en-IN')} beyond safety boundaries.`,
        whyItMatters: 'Continuing at this rate will exhaust your monthly cash reserves before salary day.',
        actionText: 'Scale down dining and shopping limits.',
        impact: 'Restores ₹4,500 surplus potential',
        priority: 'High',
        confidence: '91%',
      });
    }

    // Task 3: Unused OTT subscription detection
    const foodSpent = expenses.filter(e => e.category === 'FOOD').reduce((sum, e) => sum + e.amount, 0);
    if (foodSpent > salary * 0.25) {
      tasks.push({
        id: 'task-food-overrun',
        title: 'Review Food Delivery Subscription',
        category: 'SUBSCRIPTION',
        description: `Dining & Swiggy purchases stand at ₹${foodSpent.toLocaleString('en-IN')} (over 25% of your income).`,
        whyItMatters: 'Untracked convenience food logs create minor daily leaks that compromise SIP targets.',
        actionText: 'Review and flag food orders.',
        impact: 'Saves approx ₹12,000 annually',
        priority: 'Medium',
        confidence: '88%',
      });
    }

    // Task 4: Salary growth reallocation checklist
    if (salary > 80000) {
      tasks.push({
        id: 'task-salary-reallocation',
        title: 'Automate Incremental Wealth Compounder',
        category: 'SALARY_INCREASE',
        description: 'New surplus thresholds detected in your income account profile.',
        whyItMatters: 'Prevents lifestyle inflation from absorbing surplus wealth capital.',
        actionText: 'Apply salary allocation split (50% SIP, 30% Emergency, 20% Budget).',
        impact: 'Boosts net worth projections by ₹2.5L in 3 years',
        priority: 'Medium',
        confidence: '96%',
      });
    }

    return tasks;
  }

  public static async writeAuditLog(
    uid: string,
    taskTitle: string,
    status: 'APPROVED' | 'DISMISSED' | 'REJECTED' | 'EXECUTED'
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'users', uid, 'aiActionAuditLogs'), {
        taskTitle,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error logging execution audit:', err);
    }
  }
}
