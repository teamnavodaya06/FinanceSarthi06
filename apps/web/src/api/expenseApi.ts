import { Expense, ApiResponse } from '@financesarthi/types';
import { getApiBaseUrl } from './config';

const getBASE_URL = () => getApiBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const expenseApi = {
  async createExpense(data: any): Promise<ApiResponse<Expense>> {
    const response = await fetch(`${getApiBaseUrl()}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getExpenses(): Promise<ApiResponse<{ expenses: Expense[] }>> {
    const response = await fetch(`${getApiBaseUrl()}/expenses`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${getApiBaseUrl()}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};
