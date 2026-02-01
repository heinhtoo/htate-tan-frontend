/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export const DebouncedQtyInput = ({ item, updateQty }: any) => {
  // 1. Local state to handle the "raw" typing experience
  const [localVal, setLocalVal] = useState<string>(item.qty.toString());

  // 2. Sync local state if the cart changes from outside (e.g., plus/minus buttons)
  useEffect(() => {
    setLocalVal(item.qty.toString());
  }, [item.qty]);

  // 3. The Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = parseInt(localVal);
      if (!isNaN(parsed) && parsed !== item.qty) {
        updateQty(item.id, parsed - item.qty);
      } else if (localVal === "" && item.qty !== 0) {
        updateQty(item.id, -item.qty); // Set to 0 if cleared
      }
    }, 500); // Wait 500ms after last keystroke

    return () => clearTimeout(timer);
  }, [localVal]);

  return (
    <Input
      type="number"
      className="w-14 h-8 bg-transparent border-none text-center font-black text-sm focus-visible:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      value={localVal}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setLocalVal(e.target.value)}
    />
  );
};
