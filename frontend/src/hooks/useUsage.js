// ══════════════════════════════════════════════════
// useUsage Hook — Usage ও Plan Tracking
// ══════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { getUsage } from '../lib/api';

export function useUsage(user) {
  const [usage, setUsage] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUsage();
      setUsage(data);
    } catch {
      // silent fail
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, refreshUsage: refresh };
}
