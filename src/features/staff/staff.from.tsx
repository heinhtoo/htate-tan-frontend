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
import { Textarea } from "@/components/ui/textarea";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createStaff, updateStaff } from "./staff.action";
import type { StaffResponse } from "./staff.response";
import { StaffSchema, StaffUpdateSchema } from "./staff.schema";

interface StaffFormProps {
  initialData: StaffResponse | null;
  onSubmitComplete: () => void;
}

export default function StaffForm({
  initialData,
  onSubmitComplete,
}: StaffFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<any>({
    resolver: zodResolver(isEditing ? StaffUpdateSchema : StaffSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      nrc: initialData?.nrc ?? "",
      password: "",
      phoneNumber: initialData?.phoneNumber ?? "",
      state: initialData?.state ?? "",
      township: initialData?.township ?? "",
      username: initialData?.username ?? "",
      warehouseId: initialData?.warehouse?.id ?? undefined,
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof StaffSchema>) {
    const action = isEditing
      ? updateStaff({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createStaff({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Staff "${values.name}" updated successfully.`
        : `New Staff "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Username */}
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading || isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        {!isEditing && (
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        {/* NRC */}
        <FormField
          control={control}
          name="nrc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NRC</FormLabel>
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

        {/* Warehouse */}
        <FormField
          control={control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse</FormLabel>
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
            {isEditing ? "Save Changes" : "Create Staff"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
