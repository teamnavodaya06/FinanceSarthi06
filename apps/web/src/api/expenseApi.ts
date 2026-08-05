import { Expense, ApiResponse } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const expenseApi = {
  async createExpense(data: any): Promise<ApiResponse<Expense>> {
    const response = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getExpenses(): Promise<ApiResponse<{ expenses: Expense[] }>> {
    const response = await fetch(`${BASE_URL}/expenses`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};
