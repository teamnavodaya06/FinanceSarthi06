import { Income, CreateIncomeDto, UpdateIncomeDto, ApiResponse } from '@financesarthi/types';
import { getApiBaseUrl } from './config';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const incomeApi = {
  async createIncome(data: CreateIncomeDto): Promise<ApiResponse<Income>> {
    const response = await fetch(`${getApiBaseUrl()}/income`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getIncome(): Promise<ApiResponse<Income>> {
    const response = await fetch(`${getApiBaseUrl()}/income`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async getSummary(): Promise<ApiResponse<any>> {
    const response = await fetch(`${getApiBaseUrl()}/income/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async getIncomeById(id: string): Promise<ApiResponse<Income>> {
    const response = await fetch(`${getApiBaseUrl()}/income/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async updateIncome(id: string, data: UpdateIncomeDto): Promise<ApiResponse<Income>> {
    const response = await fetch(`${getApiBaseUrl()}/income/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async replaceIncome(id: string, data: CreateIncomeDto): Promise<ApiResponse<Income>> {
    const response = await fetch(`${getApiBaseUrl()}/income/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteIncome(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${getApiBaseUrl()}/income/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};
