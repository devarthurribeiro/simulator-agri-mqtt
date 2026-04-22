import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "../../shared/types.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function useSSE() {
  const [data, setData] = useState<DashboardData>({
    temperature: null,
    humidity: null,
    irrigator: null,
    history: [],
  });
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`${API_URL}/api/events`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as DashboardData;
      setData(parsed);
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
    };
  }, []);

  const sendIrrigatorCommand = async (
    action: "on" | "off",
    duration?: number,
  ) => {
    await fetch(`${API_URL}/api/actuators/irrigator/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, duration }),
    });
  };

  return { data, connected, sendIrrigatorCommand };
}
