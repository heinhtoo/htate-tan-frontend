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
import { Textarea } from "@/components/ui/textarea";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createWarehouse, updateWarehouse } from "./warehouse.action";
import type { WarehouseResponse } from "./warehouse.response";
import { WarehouseSchema } from "./warehouse.schema";

interface WarehouseFormProps {
  initialData: WarehouseResponse | null;
  onSubmitComplete: () => void;
}

export default function WarehouseForm({
  initialData,
  onSubmitComplete,
}: WarehouseFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof WarehouseSchema>>({
    resolver: zodResolver(WarehouseSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof WarehouseSchema>) {
    const action = isEditing
      ? updateWarehouse({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createWarehouse({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Warehouse "${values.name}" updated successfully.`
        : `New Warehouse "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Warehouse Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Main Warehouse"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Yangon Industrial Zone"
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Leading Text (Optional) */}
        <FormField
          control={control}
          name="orderLeadingText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Leading Text (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., WH-YGN"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Sellable */}
        <FormField
          control={control}
          name="isSellable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Sellable Warehouse</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Allow selling products from this warehouse
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
            {isEditing ? "Save Changes" : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
