import { useState, useEffect } from 'react';
import { Goal, GoalAnalytics, GoalForecast } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/goals`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success) {
        setGoals(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (data: Partial<Goal>) => {
    try {
      const res = await fetch(`${BASE_URL}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchGoals();
      }
      return json.success;
    } catch (err) {
      console.error('Failed to create goal:', err);
      return false;
    }
  };

  const updateGoal = async (goalId: string, data: Partial<Goal>) => {
    try {
      const res = await fetch(`${BASE_URL}/goals/${goalId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchGoals();
      }
      return json.success;
    } catch (err) {
      console.error('Failed to update goal:', err);
      return false;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        await fetchGoals();
      }
      return json.success;
    } catch (err) {
      console.error('Failed to delete goal:', err);
      return false;
    }
  };

  const addContribution = async (goalId: string, amount: number) => {
    try {
      const res = await fetch(`${BASE_URL}/goals/${goalId}/contributions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchGoals();
      }
      return json.success;
    } catch (err) {
      console.error('Failed to add contribution:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return { goals, loading, createGoal, updateGoal, deleteGoal, addContribution, refresh: fetchGoals };
}

export function useGoalForecast(goalId: string | null) {
  const [forecast, setForecast] = useState<GoalForecast | null>(null);
  const [simData, setSimData] = useState<any | null>(null);

  useEffect(() => {
    if (!goalId) return;
    const fetchForecast = async () => {
      try {
        const res = await fetch(`${BASE_URL}/goals/forecast/${goalId}`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success) {
          setForecast(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch forecast:', err);
      }
    };

    fetchForecast();
  }, [goalId]);

  const simulateDouble = async () => {
    if (!goalId) return null;
    try {
      const res = await fetch(`${BASE_URL}/goals/simulate/${goalId}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setSimData(json.data);
      }
      return json.data;
    } catch (err) {
      console.error('Failed to simulate double contribution:', err);
      return null;
    }
  };

  return { forecast, simData, simulateDouble };
}

export function useGoalAnalytics() {
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${BASE_URL}/goals/analytics`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success) {
          setAnalytics(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);

  return { analytics };
}
