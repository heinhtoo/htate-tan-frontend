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
import { Textarea } from "@/components/ui/textarea";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSupplier, updateSupplier } from "./supplier.action";
import type { SupplierResponse } from "./supplier.response";
import { SupplierSchema } from "./supplier.schema";

interface SupplierFormProps {
  initialData: SupplierResponse | null;
  onSubmitComplete: () => void;
}

export default function SupplierForm({
  initialData,
  onSubmitComplete,
}: SupplierFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof SupplierSchema>>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
      contact: initialData?.contact ?? "",
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof SupplierSchema>) {
    const action = isEditing
      ? updateSupplier({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createSupplier({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Supplier "${values.name}" updated successfully.`
        : `New Supplier "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Supplier Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Hats, Umbrellas"
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
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
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
            {isEditing ? "Save Changes" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
