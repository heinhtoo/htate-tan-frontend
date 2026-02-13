import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => Promise<void>,
  delay: number | null,
) {
  const isRunning = useRef(false);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = async () => {
      if (isRunning.current) return; // prevent overlapping
      isRunning.current = true;

      try {
        await savedCallback.current();
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        isRunning.current = false;
      }
    };

    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}
