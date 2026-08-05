import { useState, useEffect } from 'react';
import { GoalCoachRecommendation } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useGoalCoach() {
  const [recommendations, setRecommendations] = useState<GoalCoachRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/goals/coach/recommendations`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI coach recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recommendationId: string, action: 'APPROVE' | 'DISMISS') => {
    try {
      const res = await fetch(`${BASE_URL}/goals/coach/recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchRecommendations();
      }
      return json.success;
    } catch (err) {
      console.error('Failed to submit AI coach card decision:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return { recommendations, loading, handleAction, refresh: fetchRecommendations };
}
export default useGoalCoach;
