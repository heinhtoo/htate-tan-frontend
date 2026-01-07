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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ImageButton from "../media/image-button";
import { createPaymentType, updatePaymentType } from "./payment-type.action";
import type { PaymentTypeResponse } from "./payment-type.response";
import { PaymentTypeSchema } from "./payment-type.schema";

interface PaymentTypeFormProps {
  initialData: PaymentTypeResponse | null;
  onSubmitComplete: () => void;
}

export default function PaymentTypeForm({
  initialData,
  onSubmitComplete,
}: PaymentTypeFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<z.infer<typeof PaymentTypeSchema>>({
    resolver: zodResolver(PaymentTypeSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      imagePath: initialData?.imagePath ?? "",
      accountNo: initialData?.accountNo ?? "",
      commission: initialData?.commission ?? 0,
      displayName: initialData?.displayName ?? "",
      showQR: initialData?.showQR ?? false,
      showValue: initialData?.showValue ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      imagePath: initialData?.imagePath ?? "",
      accountNo: initialData?.accountNo ?? "",
      commission: initialData?.commission ?? 0,
      displayName: initialData?.displayName ?? "",
      showQR: initialData?.showQR ?? false,
      showValue: initialData?.showValue ?? false,
    });
  }, [initialData]);

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof PaymentTypeSchema>) {
    const action = isEditing
      ? updatePaymentType({
          id: initialData!.id,
          version: initialData!.version,
          data: values,
        })
      : createPaymentType({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `PaymentType "${values.name}" updated successfully.`
        : `New PaymentType "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* PaymentType Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PaymentType Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., KBZ Pay"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Name */}
        <FormField
          control={control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., KBZ Pay Wallet"
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
              <FormLabel>Description</FormLabel>
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

        {/* Image Upload */}
        <FormField
          control={control}
          name="imagePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageButton value={field.value} setValue={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="qrPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR Code</FormLabel>
              <FormControl>
                <ImageButton value={field.value} setValue={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account No (Optional) */}
        <FormField
          control={control}
          name="accountNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account No (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 123456789"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Commission */}
        <FormField
          control={control}
          name="commission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commission (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isLoading}
                  onWheelCapture={(e) => e.currentTarget.blur()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Toggles */}
        <div className="grid grid-cols-1 gap-4">
          {/* Show QR */}
          <FormField
            control={control}
            name="showQR"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Show QR</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Display QR code for this payment type
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

          {/* Show Value */}
          <FormField
            control={control}
            name="showValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Show Value</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    ပြန်အမ်းရန်ရှိပါက ယခု account ကိုအသုံးပြုမည်။
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
            {isEditing ? "Save Changes" : "Create PaymentType"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
