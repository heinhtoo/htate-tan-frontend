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
import { Textarea } from "@/components/ui/textarea";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCustomer, updateCustomer } from "./customer.action";
import type { CustomerResponse } from "./customer.response";
import { CustomerSchema } from "./customer.schema";

interface CustomerFormProps {
  initialData: CustomerResponse | null;
  onSubmitComplete: () => void;
}

export default function CustomerForm({
  initialData,
  onSubmitComplete,
}: CustomerFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof CustomerSchema>>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      state: initialData?.state ?? "",
      township: initialData?.township ?? "",
      creditLimit: initialData?.creditLimit ?? 0,
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof CustomerSchema>) {
    const action = isEditing
      ? updateCustomer({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createCustomer({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Customer "${values.name}" updated successfully.`
        : `New Customer "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="township"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Township</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Credit Limit */}
        <FormField
          control={control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Limit</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
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
            {isEditing ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
