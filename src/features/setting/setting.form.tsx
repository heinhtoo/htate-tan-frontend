import { Button } from "@/components/ui/button";
// Removed Card components imports here since we are using FormItem/div styling
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Switch } from "@/components/ui/switch"; // Assumed
import { type ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateSetting } from "./setting.action";
import type { KeyValueType } from "./setting.response";

// Helper function to convert the stored string value ("true"/"false") to a boolean
const stringToBoolean = (value: string) => value.toLowerCase() === "true";

// Helper function to convert the boolean back to a string for submission
const booleanToString = (value: boolean) => (value ? "true" : "false");

function SettingForm({
  settingKey,
  type,
  data,
  onSubmitComplete,
  title,
  description,
}: {
  settingKey: string;
  data: {
    value: string; // value is a string "true" or "false"
  };
  type: KeyValueType;
  onSubmitComplete: () => void;
  title: string;
  description: string;
}) {
  const { setError } = useErrorStore();

  const [isLoading, startTransition] = useTransition();

  const formSchema = z.object({
    value: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: stringToBoolean(data.value),
    },
    // Reset form values when initial data changes (e.g., after refetching)
    values: {
      value: stringToBoolean(data.value),
    },
  });

  function onSubmit(formData: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submissionData = {
        value: booleanToString(formData.value),
      };

      const result = await updateSetting({
        data: submissionData,
        settingKey,
        type,
      });
      if (result.response?.isSuccess) {
        toast.success(`'${title}' updated successfully.`);
        onSubmitComplete();
      } else {
        setError(result.error as ErrorResponse);
        toast.error(`Failed to update '${title}'.`);
      }
    });
  }

  // Determine if the form is dirty (i.e., user changed the switch)
  const isDirty = form.formState.isDirty;

  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start justify-between">
                {/* Setting Description Area */}
                <div className="space-y-1 max-w-[70%]">
                  <FormLabel className="text-base font-medium">
                    {title}
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <FormMessage />
                  <p className="text-xs font-semibold pt-1">
                    Status:{" "}
                    <span
                      className={
                        field.value ? "text-green-600" : "text-red-600"
                      }
                    >
                      {field.value ? "ENABLED" : "DISABLED"}
                    </span>
                  </p>
                </div>

                {/* Switch and Save Area */}
                <div className="flex flex-col items-end space-y-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>

                  {/* Conditional Save Button */}
                  {isDirty && (
                    <Button disabled={isLoading} type="submit" size="sm">
                      {isLoading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save
                    </Button>
                  )}
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default SettingForm;
