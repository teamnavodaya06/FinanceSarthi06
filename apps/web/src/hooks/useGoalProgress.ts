import { useState, useEffect } from 'react';
import { GoalProgress, GoalHealth, GoalMilestone } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useGoalProgress(goalId: string | null) {
  const [progress, setProgress] = useState<GoalProgress | null>(null);

  useEffect(() => {
    if (!goalId) return;
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${BASE_URL}/goals/${goalId}/progress`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success) {
          setProgress(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch goal progress:', err);
      }
    };
    fetchProgress();
  }, [goalId]);

  return { progress };
}

export function useGoalHealth(goalId: string | null) {
  const [health, setHealth] = useState<GoalHealth | null>(null);

  useEffect(() => {
    if (!goalId) return;
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/goals/${goalId}/health`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success) {
          setHealth(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch goal health:', err);
      }
    };
    fetchHealth();
  }, [goalId]);

  return { health };
}

export function useGoalMilestones(goalId: string | null) {
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);

  useEffect(() => {
    if (!goalId) return;
    const fetchMilestones = async () => {
      try {
        const res = await fetch(`${BASE_URL}/goals/${goalId}/milestones`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success) {
          setMilestones(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch goal milestones:', err);
      }
    };
    fetchMilestones();
  }, [goalId]);

  return { milestones };
}
