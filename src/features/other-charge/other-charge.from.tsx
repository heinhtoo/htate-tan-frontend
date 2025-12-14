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
import { createOtherCharge, updateOtherCharge } from "./other-charge.action";
import type { OtherChargeResponse } from "./other-charge.response";
import { OtherChargeSchema } from "./other-charge.schema";

interface OtherChargeFormProps {
  initialData: OtherChargeResponse | null;
  onSubmitComplete: () => void;
}

export default function OtherChargeForm({
  initialData,
  onSubmitComplete,
}: OtherChargeFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof OtherChargeSchema>>({
    resolver: zodResolver(OtherChargeSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof OtherChargeSchema>) {
    const action = isEditing
      ? updateOtherCharge({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createOtherCharge({ data: values });

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
        {/* OtherCharge Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OtherCharge Name</FormLabel>
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

        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description..."
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
            {isEditing ? "Save Changes" : "Create OtherCharge"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
