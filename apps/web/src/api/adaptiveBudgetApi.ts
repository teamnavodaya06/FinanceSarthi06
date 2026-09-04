import { 
  AdaptiveBudgetHealth, 
  ScenarioSimulationInput, 
  ScenarioSimulationResult 
} from '@financesarthi/types';
import { getApiBaseUrl } from './config';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const adaptiveBudgetApi = {
  async getRecommendations(): Promise<any[]> {
    const response = await fetch(`${getApiBaseUrl()}/adaptive-budget/recommendations`, {
      headers: getHeaders(),
    });
    const res = await response.json();
    return res.data || [];
  },

  async approveAction(recommendationId: string, categoryOverrides: Record<string, number> = {}): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/adaptive-budget/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recommendationId, categoryOverrides }),
    });
    const res = await response.json();
    return res.data;
  },

  async dismissAction(recommendationId: string): Promise<any> {
    const response = await fetch(`${getApiBaseUrl()}/adaptive-budget/dismiss`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recommendationId }),
    });
    const res = await response.json();
    return res.data;
  },

  async runSimulation(data: ScenarioSimulationInput): Promise<ScenarioSimulationResult> {
    const response = await fetch(`${getApiBaseUrl()}/adaptive-budget/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const res = await response.json();
    return res.data;
  },

  async getHealthScore(): Promise<AdaptiveBudgetHealth> {
    const response = await fetch(`${getApiBaseUrl()}/adaptive-budget/health`, {
      headers: getHeaders(),
    });
    const res = await response.json();
    return res.data;
  },
};
export default adaptiveBudgetApi;
