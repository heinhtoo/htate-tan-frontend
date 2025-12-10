import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePanelStore } from "@/store/panelStore";
import { X } from "lucide-react";
import { useEffect } from "react";

function Panel() {
  const pathname = location.pathname;
  const { isPanelOpen, panelContent, closePanel, title } = usePanelStore();

  useEffect(() => {
    closePanel();
  }, [pathname]);
  return (
    <aside
      className={cn(
        "fixed right-0 top-0 bottom-0 w-full md:w-[400px] p-3 transform transition-transform duration-300 ease-in-out flex flex-col",
        isPanelOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="bg-white h-full rounded-3xl shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={closePanel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grow p-4 overflow-y-auto max-h-[85vh]">
          {panelContent}
        </div>
      </div>
    </aside>
  );
}

export default Panel;
