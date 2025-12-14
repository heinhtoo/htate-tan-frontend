/* eslint-disable react-hooks/set-state-in-effect */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Minus, Plus, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ProductResponse } from "../product/product.response";

export const UnitSelectionSheet = ({
  product,
  isOpen,
  onOpenChange,
  onSelectUnit,
}: {
  product: ProductResponse;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUnit: (unitName: string, multiplier: number) => void;
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(""); // Stores the ID as a string
  const [qtyToAddToCart, setQtyToAddToCart] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the selected conversion object
  const selectedConversion = product.unitConversions?.find(
    (u) => u.id === parseInt(selectedUnit)
  );

  // Calculate the total base units being added
  const totalBaseUnits = selectedConversion
    ? qtyToAddToCart * selectedConversion.conversionRate
    : qtyToAddToCart;

  const basePrice = product.price;

  const handleConfirm = () => {
    if (
      !selectedUnit &&
      product.unitConversions &&
      product.unitConversions.length > 0
    ) {
      toast.error("Please select a unit of measure.");
      return;
    }

    setIsSubmitting(true);

    // Default to 'Unit' if no conversions exist or no selection was made
    const unitName = selectedConversion?.name || "Unit";
    const multiplier = selectedConversion?.conversionRate || 1;

    // Add the calculated quantity and unit details to the cart
    onSelectUnit(unitName, multiplier * qtyToAddToCart);

    // Reset state and close
    setTimeout(() => {
      // Simulate API latency if needed
      setIsSubmitting(false);
      onOpenChange(false);
      setSelectedUnit("");
      setQtyToAddToCart(1);
    }, 100);
  };

  useEffect(() => {
    // If the sheet opens and there are conversions, auto-select the first one
    if (
      isOpen &&
      product.unitConversions &&
      product.unitConversions.length > 0
    ) {
      setSelectedUnit(product.unitConversions[0].id.toString());
    }
    // If the sheet opens, reset quantity to 1
    if (isOpen) {
      setQtyToAddToCart(1);
    }
  }, [isOpen, product.unitConversions]);

  // Determine if product has conversions or is just a single unit
  const hasConversions =
    product.unitConversions && product.unitConversions.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 flex flex-col rounded-t-2xl"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <RefreshCcw className="h-5 w-5" />
            Unit Selection for: {product.name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Unit Selection */}
          {hasConversions && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Select Unit Type:</h4>
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full h-11 bg-white">
                  <SelectValue placeholder="Select Sale Unit" />
                </SelectTrigger>
                <SelectContent>
                  {/* Default single unit option */}
                  <SelectItem value={product.id.toString() + "-unit"}>
                    1 Unit (Base)
                  </SelectItem>
                  {/* Converted Units */}
                  {product.unitConversions?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.conversionRate} base units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-700">Quantity to Add:</h4>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() =>
                  setQtyToAddToCart((prev) => Math.max(1, prev - 1))
                }
                disabled={isSubmitting}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={qtyToAddToCart}
                onChange={(e) =>
                  setQtyToAddToCart(parseInt(e.target.value) || 1)
                }
                className="w-24 text-center h-10 text-lg font-bold"
                min={1}
                disabled={isSubmitting}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQtyToAddToCart((prev) => prev + 1)}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <span className="text-gray-500 ml-4">
                x {selectedConversion?.conversionRate || 1} Base Units
              </span>
            </div>
          </div>

          {/* Summary Display */}
          <Card className="p-4 bg-blue-50/50 border-blue-200 mt-6 space-y-2">
            <p className="text-sm font-semibold text-blue-700">
              Order Summary:
            </p>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Units Added:</span>
              <span className="font-bold">
                {qtyToAddToCart} x {selectedConversion?.name || "Unit"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Base Units:</span>
              <span className="font-bold text-lg text-primary">
                {totalBaseUnits} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per Unit Added:</span>
              <span className="font-bold text-lg text-primary">
                {(basePrice * totalBaseUnits).toLocaleString()} Ks
              </span>
            </div>
          </Card>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t">
          <Button
            className="w-full h-12 text-md gap-2"
            onClick={handleConfirm}
            disabled={isSubmitting || totalBaseUnits === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add {totalBaseUnits} Base Units to Cart
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
