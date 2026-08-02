import { Expense } from '@financesarthi/types';

export interface TimelineBucket {
  title: string;
  expenses: Expense[];
}

export class TimelineService {
  public static groupExpenses(expenses: Expense[]): TimelineBucket[] {
    const sorted = [...expenses].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayList: Expense[] = [];
    const yesterdayList: Expense[] = [];
    const thisWeekList: Expense[] = [];
    const lastWeekList: Expense[] = [];
    const earlierMonthList: Expense[] = [];
    const previousMonthsList: Expense[] = [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    for (const exp of sorted) {
      const expDate = new Date(exp.date);
      
      if (exp.date === todayStr) {
        todayList.push(exp);
      } else if (exp.date === yesterdayStr) {
        yesterdayList.push(exp);
      } else if (expDate >= oneWeekAgo) {
        thisWeekList.push(exp);
      } else if (expDate >= twoWeeksAgo) {
        lastWeekList.push(exp);
      } else if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        earlierMonthList.push(exp);
      } else {
        previousMonthsList.push(exp);
      }
    }

    const buckets: TimelineBucket[] = [];
    if (todayList.length > 0) buckets.push({ title: 'Today', expenses: todayList });
    if (yesterdayList.length > 0) buckets.push({ title: 'Yesterday', expenses: yesterdayList });
    if (thisWeekList.length > 0) buckets.push({ title: 'This Week', expenses: thisWeekList });
    if (lastWeekList.length > 0) buckets.push({ title: 'Last Week', expenses: lastWeekList });
    if (earlierMonthList.length > 0) buckets.push({ title: 'Earlier This Month', expenses: earlierMonthList });
    if (previousMonthsList.length > 0) buckets.push({ title: 'Previous Months', expenses: previousMonthsList });

    return buckets;
  }
}
