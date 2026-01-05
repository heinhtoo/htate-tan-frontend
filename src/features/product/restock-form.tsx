/* eslint-disable @typescript-eslint/no-explicit-any */
import WarehouseDropdown from "@/components/dropdown/warehouse.dropdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { restockProduct } from "./product.action";
import { RestockSchema } from "./product.schema";

interface RestockFormProps {
  productId: number;
  productName: string;
  onSubmitComplete: () => void;
}

// --- PLACEHOLDERS: Replace with your real data hook for currencies ---
const currencies = ["MMK", "USD", "EUR", "THB", "SGD"];
// -------------------------------------------------------------------

export default function RestockForm({
  productId,
  productName,
  onSubmitComplete,
}: RestockFormProps) {
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore(); // Assuming this form closes a panel/modal

  const form = useForm<any>({
    resolver: zodResolver(RestockSchema),
    defaultValues: {
      productId: productId,
      purchasedQuantity: 0,
      purchasedPrice: 0,
      purchasedCurrency: "MMK", // Default to base currency
      purchasedPriceInMMK: 0,
      warehouseId: undefined,
    },
  });

  const { handleSubmit, control, formState, watch } = form;
  const isLoading = formState.isSubmitting;

  // Watch necessary fields for dynamic calculations or display
  const watchedQuantity = watch("purchasedQuantity");
  const watchedPriceMMK = watch("purchasedPriceInMMK");

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof RestockSchema>) {
    // Ensure numbers are passed as numbers, not strings from the form
    const data = {
      ...values,
      purchasedQuantity: Number(values.purchasedQuantity),
      purchasedPrice: Number(values.purchasedPrice),
      purchasedPriceInMMK: Number(values.purchasedPriceInMMK),
    };

    const { error } = await restockProduct({ payload: data }); // Your API call

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      `Restocked ${values.purchasedQuantity} units of ${productName}.`
    );

    onSubmitComplete();
    closePanel();
  }

  // Calculate total cost for display purposes
  const totalCost = watchedQuantity * watchedPriceMMK;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Hidden Field for Product Context */}
        <input type="hidden" {...form.register("productId")} />

        <h3 className="text-lg font-semibold border-b pb-2">
          Restock: {productName}
        </h3>

        {/* Warehouse Selection */}
        <FormField
          control={control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Warehouse</FormLabel>
              <FormControl>
                <WarehouseDropdown
                  value={field.value}
                  setValue={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Purchased Quantity */}
        <FormField
          control={control}
          name="purchasedQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Purchased</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                  disabled={isLoading}
                  onWheelCapture={(e) => e.currentTarget.blur()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 2: Purchase Price (Foreign) & Currency */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="purchasedPrice"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Unit Cost (Foreign/Original)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    disabled={isLoading}
                    onWheelCapture={(e) => e.currentTarget.blur()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="purchasedCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="MMK" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purchased Price in MMK (Base Cost) */}
        <FormField
          control={control}
          name="purchasedPriceInMMK"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Cost in MMK (Base Currency)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  disabled={isLoading}
                  onWheelCapture={(e) => e.currentTarget.blur()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Cost Summary */}
        <div className="text-right text-lg font-bold text-gray-700 pt-2 border-t">
          Total Purchase Cost (MMK):{" "}
          {new Intl.NumberFormat("my-MM", {
            style: "currency",
            currency: "MMK",
          }).format(totalCost)}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closePanel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Restock
          </Button>
        </div>
      </form>
    </Form>
  );
}
