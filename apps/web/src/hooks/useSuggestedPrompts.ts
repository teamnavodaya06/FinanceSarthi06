import { useState, useEffect } from 'react';
import { SuggestedPrompt, TodayFocus } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useSuggestedPrompts() {
  const [prompts, setPrompts] = useState<SuggestedPrompt[]>([]);
  const [todayFocus, setTodayFocus] = useState<TodayFocus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/prompts/suggestions`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPrompts(json.data.prompts || []);
          setTodayFocus(json.data.todayFocus || []);
        }
      } catch (err) {
        console.error('Failed to fetch suggested prompts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  return { prompts, todayFocus, loading };
}
