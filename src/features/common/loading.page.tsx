import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function LoadingPage({
  className,
  text = "Loading content, please wait...",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-full min-h-[150px] z-50",
        "absolute inset-0",
        className
      )}
    >
      <Spinner className="h-8 w-8 text-primary" />

      {/* The text prop now has a default value, so it will always display */}
      <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
        {text}
      </p>
    </div>
  );
}

export default LoadingPage;
