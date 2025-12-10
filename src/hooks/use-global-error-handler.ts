// src/hooks/useGlobalErrorHandler.ts
import { useEffect, useState } from "react";

export function useGlobalErrorHandler() {
  const [hasError, setHasError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setMessage(event.message);
      setHasError(true);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setMessage(String(event.reason));
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return { hasError, message };
}
