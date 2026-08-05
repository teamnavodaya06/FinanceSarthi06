import { useState, useEffect } from 'react';
import { AIStatus, HealthStatus } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useAIStatus() {
  const [status, setStatus] = useState<AIStatus>('CONNECTED');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/reliability/health`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setHealth(json.data);
          if (json.data.circuitState === 'OPEN') {
            setStatus('LIMITED');
          } else {
            setStatus('CONNECTED');
          }
        }
      } catch (err) {
        console.error('Failed to query AI health indicators:', err);
        setStatus('OFFLINE');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return { status, health };
}

export function useAIFeedback() {
  const submitFeedback = async (messageId: string, rating: 'THUMBS_UP' | 'THUMBS_DOWN', comment?: string) => {
    try {
      const res = await fetch(`${BASE_URL}/reliability/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ messageId, rating, comment }),
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Failed to submit user feedback rating:', err);
      return false;
    }
  };

  return { submitFeedback };
}
