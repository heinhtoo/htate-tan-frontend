/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Switch } from "@/components/ui/switch";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { BrandResponse } from "../brand/brand.response";
import { modifyPrice } from "./product-group.action";
import { ModifyPriceSchema } from "./product-group.schema";

interface ModifyProductGroupFormProps {
  initialData: BrandResponse | null;
  onSubmitComplete: () => void;
}

export default function ModifyProductGroupForm({
  initialData,
  onSubmitComplete,
}: ModifyProductGroupFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<any>({
    resolver: zodResolver(ModifyPriceSchema),
    defaultValues: {
      isPercent: false,
      isIncrement: true,
      value: 0,
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof ModifyPriceSchema>) {
    const action = modifyPrice({
      id: initialData!.id,
      data: values,
    });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(`Price updated successfully.`);

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* ProductGroup Name */}
        <FormField
          control={control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
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
          name="isPercent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Percentage Based</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Enable this to apply the price change as a percentage instead
                  of a fixed amount.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="isIncrement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Increase Price</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Turn this on to increase the price. Turn it off to decrease
                  the price.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

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
            {isEditing ? "Save Changes" : "Create ProductGroup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
