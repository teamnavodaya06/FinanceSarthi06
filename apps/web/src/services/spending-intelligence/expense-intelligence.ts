import { Expense, Goal, Asset, Liability } from '@financesarthi/types';
import { db } from '../../config/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { SpendingHealthService } from './spending-health.service';
import { CashFlowService } from './cash-flow.service';
import { FinancialStoryService } from './financial-story.service';
import { SpendingCoachService } from './spending-coach.service';

export class ExpenseIntelligenceEngine {
  public static async run(
    uid: string,
    expenses: Expense[],
    monthlyIncome: number,
    goals: Goal[] = [],
    assets: Asset[] = [],
    liabilities: Liability[] = []
  ): Promise<void> {
    try {
      const activeExpenses = expenses.filter(e => !e.isDeleted);
      const totalSpent = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
      const income = monthlyIncome || 85000;
      const todayStr = new Date().toISOString().split('T')[0];

      // -------------------------------------------------------------
      // 1. Expense Summary Engine
      // -------------------------------------------------------------
      const todaySpent = activeExpenses
        .filter(e => e.date === todayStr)
        .reduce((sum, e) => sum + e.amount, 0);

      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const currentDay = new Date().getDate();
      const averageDailySpent = Math.round(totalSpent / (currentDay || 1));

      const categoryTotals = activeExpenses.reduce((acc: Record<string, number>, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

      const merchantTotals = activeExpenses.reduce((acc: Record<string, number>, exp) => {
        if (exp.merchant) {
          acc[exp.merchant] = (acc[exp.merchant] || 0) + exp.amount;
        }
        return acc;
      }, {});

      const recurringSpent = activeExpenses
        .filter(e => e.isRecurring)
        .reduce((sum, e) => sum + e.amount, 0);

      const summaryData = {
        totalSpent,
        todaySpent,
        averageDailySpent,
        recurringSpent,
        categoryTotals,
        merchantTotals,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid, 'summary', 'current'), summaryData);

      // -------------------------------------------------------------
      // 2. Budget Engine
      // -------------------------------------------------------------
      const budgetRemaining = Math.max(0, income - totalSpent);
      const budgetPct = income > 0 ? Math.round((totalSpent / income) * 100) : 0;
      const overspendingStatus = totalSpent > income;

      const budgetData = {
        monthlyBudget: income,
        spent: totalSpent,
        remaining: budgetRemaining,
        budgetPercentage: budgetPct,
        overspendingStatus,
        recommendedBudget: income * 0.8,
        AIRecommendation: totalSpent > income * 0.8
          ? 'Reduce non-essential shopping to restore budget buffers.'
          : 'Great budget discipline! Continue regular allocations.',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid, 'budget', 'current'), budgetData);

      // -------------------------------------------------------------
      // 3. Cash Flow Engine
      // -------------------------------------------------------------
      const investmentsSpent = categoryTotals['INVESTMENT'] || 0;
      const savings = Math.max(0, income - totalSpent);
      const remainingCash = Math.max(0, savings - investmentsSpent);

      const cashFlowData = {
        inflow: income,
        outflow: totalSpent,
        investments: investmentsSpent,
        savings,
        remainingCash,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid, 'cashflow', 'current'), cashFlowData);

      // -------------------------------------------------------------
      // 4. Spending Pattern Engine
      // -------------------------------------------------------------
      const notificationsToPost: { title: string; message: string; type: string; priority: 'low' | 'medium' | 'high' }[] = [];

      // Check for large single transactions (> 10k INR)
      const largeTx = activeExpenses.find(e => e.amount >= 10000);
      if (largeTx) {
        notificationsToPost.push({
          title: 'Large Purchase Detected',
          message: `A single purchase of ₹${largeTx.amount.toLocaleString('en-IN')} was logged at ${largeTx.merchant || 'merchant'}.`,
          type: 'VELOCITY_ALERT',
          priority: 'medium',
        });
      }

      // Check budget percentage threshold
      if (budgetPct >= 100) {
        notificationsToPost.push({
          title: 'Budget Threshold Breached',
          message: `Your monthly expenditures (₹${totalSpent.toLocaleString('en-IN')}) have exceeded your income limits.`,
          type: 'BUDGET_BREACH',
          priority: 'high',
        });
      } else if (budgetPct >= 85) {
        notificationsToPost.push({
          title: 'Budget Alert Indicator',
          message: `Burn rate warning: 85% of your cash limits have been consumed.`,
          type: 'BUDGET_WARNING',
          priority: 'medium',
        });
      }

      // -------------------------------------------------------------
      // 5. Category Analytics Engine
      // -------------------------------------------------------------
      const categoriesAnalytics = Object.entries(categoryTotals).map(([category, amount]) => {
        const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        return {
          category,
          amount,
          percentage,
          trend: amount > income * 0.15 ? 'Increasing velocity' : 'Stable levels',
        };
      });
      await setDoc(doc(db, 'users', uid, 'analytics', 'categories'), { categories: categoriesAnalytics, updatedAt: new Date().toISOString() });

      // -------------------------------------------------------------
      // 6. Merchant Analytics Engine
      // -------------------------------------------------------------
      // Group by merchant visits count & totals
      const merchantVisits = activeExpenses.reduce((acc: Record<string, number>, exp) => {
        if (exp.merchant) {
          acc[exp.merchant] = (acc[exp.merchant] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedMerchants = Object.entries(merchantTotals)
        .map(([name, amount]) => ({
          name,
          amount,
          visits: merchantVisits[name] || 0,
          percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      await setDoc(doc(db, 'users', uid, 'analytics', 'merchants'), { merchants: sortedMerchants, updatedAt: new Date().toISOString() });

      // -------------------------------------------------------------
      // 7. Financial Health Engine
      // -------------------------------------------------------------
      const healthResult = SpendingHealthService.calculateHealth(activeExpenses, income);
      await setDoc(doc(db, 'users', uid, 'health', 'current'), {
        score: healthResult.score,
        grade: healthResult.grade,
        strengths: healthResult.strengths,
        weaknesses: healthResult.weaknesses,
        suggestions: healthResult.suggestions,
        updatedAt: new Date().toISOString(),
      });

      // -------------------------------------------------------------
      // 8. AI Recommendation Engine
      // -------------------------------------------------------------
      const coachInsights = SpendingCoachService.generateInsights(activeExpenses, income);
      await setDoc(doc(db, 'users', uid, 'ai', 'insights'), {
        insights: coachInsights,
        updatedAt: new Date().toISOString(),
      });

      // -------------------------------------------------------------
      // 9. Notification Engine
      // -------------------------------------------------------------
      for (const n of notificationsToPost) {
        await addDoc(collection(db, 'users', uid, 'notifications'), {
          ...n,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      // -------------------------------------------------------------
      // 10. Monthly Financial Story Engine
      // -------------------------------------------------------------
      const storyResult = FinancialStoryService.generateStory(activeExpenses, income);
      await setDoc(doc(db, 'users', uid, 'story', 'current'), {
        headline: storyResult.headline,
        summary: storyResult.summary,
        achievements: storyResult.achievements,
        warnings: storyResult.warnings,
        prediction: storyResult.prediction,
        updatedAt: new Date().toISOString(),
      });

      console.log('Expense Intelligence Engine ran successfully!');
    } catch (err) {
      console.error('Error running Expense Intelligence Engine:', err);
    }
  }
}
