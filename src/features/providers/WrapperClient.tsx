import ErrorDialog from "@/components/error.dialog";
import { cn } from "@/lib/utils";
import React from "react";

function WrapperClient({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("bg-background")}>
      {children}
      <ErrorDialog />
    </div>
  );
}

export default WrapperClient;
