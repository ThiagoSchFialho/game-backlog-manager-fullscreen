import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function useShutdown() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shutdown = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/system/shutdown`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao desligar");
      setLoading(false);
    }
  }, []);

  return { shutdown, loading, error };
}