import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NumpadDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  currentValue: number;
  onConfirm: (value: number) => void;
  suffix?: string;
}

export default function NumpadDialog({
  open,
  onClose,
  title,
  currentValue,
  onConfirm,
  suffix = "",
}: NumpadDialogProps) {
  const [display, setDisplay] = useState(currentValue.toString());

  useEffect(() => {
    setDisplay(currentValue.toString());
  }, [currentValue]);

  const handleNumberClick = (num: string) => {
    if (display === "0") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleClear = () => {
    setDisplay("0");
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleConfirm = () => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      onConfirm(value);
      onClose();
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  // Reset display when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDisplay(currentValue.toString());
    } else {
      onClose();
    }
  };

  const numpadButtons = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [".", "0", "⌫"],
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[320px] p-0 gap-0 rounded-2xl">
        <DialogHeader className="p-4 pb-3 border-b">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>

        {/* Display */}
        <div className="p-4 bg-slate-50">
          <div className="bg-white rounded-xl p-4 text-right border-2 border-slate-200">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {display}
              {suffix && (
                <span className="text-sm font-medium text-slate-400 ml-2">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="p-4 pt-2">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {numpadButtons.map((row, rowIndex) =>
              row.map((btn, btnIndex) => (
                <button
                  key={`${rowIndex}-${btnIndex}`}
                  onClick={() => {
                    if (btn === "⌫") handleBackspace();
                    else if (btn === ".") handleDecimal();
                    else handleNumberClick(btn);
                  }}
                  className={cn(
                    "h-14 rounded-xl font-bold text-lg transition-all active:scale-95",
                    btn === "⌫"
                      ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  {btn}
                </button>
              )),
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-12 rounded-xl font-bold"
            >
              Clear
            </Button>
            <Button
              onClick={handleConfirm}
              className="h-12 rounded-xl font-bold bg-primary hover:bg-primary/90"
            >
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
