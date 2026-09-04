import { Budget, BudgetPrediction, BudgetRecommendation } from '@financesarthi/types';
import { getApiBaseUrl } from './config';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const budgetApi = {
  async getCurrentBudget(): Promise<Budget> {
    const response = await fetch(`${getApiBaseUrl()}/budgets/current`, {
      headers: getHeaders(),
    });
    const res = await response.json();
    return res.data;
  },

  async createBudget(data: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${getApiBaseUrl()}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const res = await response.json();
    return res.data;
  },

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${getApiBaseUrl()}/budgets/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const res = await response.json();
    return res.data;
  },

  async getPredictions(): Promise<BudgetPrediction> {
    const response = await fetch(`${getApiBaseUrl()}/budgets/predictions`, {
      headers: getHeaders(),
    });
    const res = await response.json();
    return res.data;
  },

  async getRecommendations(): Promise<BudgetRecommendation[]> {
    const response = await fetch(`${getApiBaseUrl()}/budgets/analytics`, {
      headers: getHeaders(),
    });
    const res = await response.json();
    return res.data;
  },
};
