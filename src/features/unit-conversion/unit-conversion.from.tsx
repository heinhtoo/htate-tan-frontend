/* eslint-disable @typescript-eslint/no-explicit-any */
import CategoryDropdown from "@/components/dropdown/category.dropdown";
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
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  createUnitConversion,
  updateUnitConversion,
} from "./unit-conversion.action";
import type { UnitConversionResponse } from "./unit-conversion.response";
import { UnitConversionSchema } from "./unit-conversion.schema";

interface UnitConversionFormProps {
  initialData: UnitConversionResponse | null;
  onSubmitComplete: () => void;
}

export default function UnitConversionForm({
  initialData,
  onSubmitComplete,
}: UnitConversionFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<any>({
    resolver: zodResolver(UnitConversionSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      categoryId: initialData?.category?.id ?? undefined,
      conversionRate: initialData?.conversionRate ?? 1,
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(
    values: z.infer<typeof UnitConversionSchema>
  ) {
    const action = isEditing
      ? updateUnitConversion({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createUnitConversion({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Other Charge "${values.name}" updated successfully.`
        : `New Other Charge "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* UnitConversion Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UnitConversion Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Box, Dozen"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="conversionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conversion Rate</FormLabel>
              <FormControl>
                <Input {...field} type="number" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategoryDropdown
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
            {isEditing ? "Save Changes" : "Create UnitConversion"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
