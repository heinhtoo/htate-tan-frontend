import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useApiConfigStore } from "@/store/apiConfigStore";
import { Check, Globe, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

function LoadingPage({
  className,
  text = "Loading content, please wait...",
}: {
  className?: string;
  text?: string;
}) {
  const { baseURL, setBaseURL } = useApiConfigStore();
  const [editMode, setEditMode] = useState(false);
  const [tempURL, setTempURL] = useState(baseURL);

  // Sync tempURL if baseURL changes externally
  useEffect(() => {
    setTempURL(baseURL);
  }, [baseURL]);

  const handleUpdate = () => {
    setBaseURL(tempURL);
    setEditMode(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50 transition-all duration-500",
        className
      )}
    >
      {/* Central Loading State */}
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <Spinner className="h-12 w-12 text-primary" />
          <div className="absolute inset-0 h-12 w-12 border-4 border-primary/10 rounded-full animate-ping" />
        </div>

        <p className="mt-6 text-sm font-medium text-slate-500 tracking-wide animate-pulse">
          {text}
        </p>
      </div>

      {/* Elegant Bottom Configuration Bar */}
      <div className="absolute bottom-10 w-full max-w-md px-6">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="group mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-slate-200 hover:border-primary/30 hover:bg-white transition-all shadow-sm shadow-slate-200/50"
          >
            <Globe
              size={14}
              className="text-slate-400 group-hover:text-primary transition-colors"
            />
            <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
              {baseURL}
            </span>
            <Settings2
              size={14}
              className="text-slate-400 group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        ) : (
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            <Input
              className="h-9 border-none bg-transparent focus-visible:ring-0 text-sm font-mono"
              value={tempURL}
              autoFocus
              onChange={(e) => setTempURL(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              placeholder="Enter API Endpoint..."
            />
            <Button
              size="sm"
              className="h-8 rounded-lg px-3 gap-1.5"
              onClick={handleUpdate}
            >
              <Check size={14} />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-slate-400"
              onClick={() => {
                setTempURL(baseURL);
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingPage;
