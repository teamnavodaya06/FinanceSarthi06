import { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetPrediction, BudgetRecommendation } from '@financesarthi/types';
import { budgetApi } from '../api/budgetApi';

export function useCurrentBudget() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetApi.getCurrentBudget();
      setBudget(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch current budget');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const updateBudget = async (data: Partial<Budget>) => {
    if (!budget) return;
    try {
      const updated = await budgetApi.updateBudget(budget.id, data);
      setBudget(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
    }
  };

  return { budget, loading, error, refresh: fetchBudget, updateBudget };
}

export function useBudgetPredictions() {
  const [predictions, setPredictions] = useState<BudgetPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetApi.getPredictions();
      setPredictions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, refresh: fetchPredictions };
}

export function useBudgetRecommendations() {
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetApi.getRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, refresh: fetchRecommendations };
}
