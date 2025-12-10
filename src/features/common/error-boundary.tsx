import { useGlobalErrorHandler } from "@/hooks/use-global-error-handler";
import React from "react";
import Error400Page from "./400.page";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { hasError, message } = useGlobalErrorHandler();

  if (hasError) {
    return <Error400Page message={message ?? "Unknown Error"} />;
  }

  return children;
}

export default ErrorBoundary;
