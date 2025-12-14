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
import { createCarGate, updateCarGate } from "./car-gate.action";
import type { CarGateResponse } from "./car-gate.response";
import { CarGateSchema } from "./car-gate.schema";

interface CarGateFormProps {
  initialData: CarGateResponse | null;
  onSubmitComplete: () => void;
}

export default function CarGateForm({
  initialData,
  onSubmitComplete,
}: CarGateFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof CarGateSchema>>({
    resolver: zodResolver(CarGateSchema),
    defaultValues: {
      gateName: initialData?.gateName ?? "",
      location: initialData?.location ?? "",
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof CarGateSchema>) {
    const action = isEditing
      ? updateCarGate({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createCarGate({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Car Gate "${values.gateName}" updated successfully.`
        : `New Car Gate "${values.gateName}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* CarGate Name */}
        <FormField
          control={control}
          name="gateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CarGate Name</FormLabel>
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief location..."
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
            {isEditing ? "Save Changes" : "Create CarGate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
