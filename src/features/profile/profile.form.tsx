import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ErrorResponse } from "@/lib/actionHelper";
import { zodResolver } from "@hookform/resolvers/zod";

import { Icons } from "@/components/ui/icons";
import { useErrorStore } from "@/store/error.store";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProfile } from "./profile.action";
import { ProfileSchema } from "./profile.schema";

function ProfileForm({
  data,
  onSubmitComplete,
}: {
  data: {
    username: string;
    email: string;
    name: string;
    phoneNumber: string;
    version: number;
  };
  onSubmitComplete: () => void;
}) {
  const { setError } = useErrorStore((state) => state);

  const [isLoading, startTransition] = useTransition();
  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: data.username ?? "",
      email: data.email ?? "",
      name: data.name ?? "",
      phoneNumber: data.phoneNumber ?? "",
    },
  });

  function onSubmit(formData: z.infer<typeof ProfileSchema>) {
    startTransition(async () => {
      const result = await updateProfile({
        data: formData,
        version: data.version,
      });
      if (result.response?.isSuccess) {
        toast.success("Profile updated successfully");

        onSubmitComplete();
      } else {
        setError(result.error as ErrorResponse);
      }
    });
  }
  return (
    <div className="mx-auto flex w-full flex-col gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full rounded-3xl bg-white"
        >
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Username</FormLabel>
                  <Input type="text" disabled={isLoading} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Name</FormLabel>
                  <Input type="text" disabled={isLoading} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" disabled={isLoading} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Phone number</FormLabel>
                  <Input type="text" disabled={isLoading} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-center justify-end sm:col-span-2">
              <Button disabled={isLoading} type="submit">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProfileForm;
