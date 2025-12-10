/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, // Assuming you have FormMessage component for validation errors
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a Spinner component
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { loginWarehouseUser } from "./auth.action";
import { WarehouseUserSignInFormSchema } from "./auth.schema";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl?: string;
}

// 💡 Renamed component from WarehouseUserSignInForm
export default function WarehouseUserSignInForm({
  callbackUrl,
  className,
  ...props
}: AuthFormProps) {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore((state) => state);
  const [isLoading, startTransition] = useTransition();
  const redirectUrl = callbackUrl ?? "/";

  const form = useForm<z.infer<typeof WarehouseUserSignInFormSchema>>({
    resolver: zodResolver(WarehouseUserSignInFormSchema),
    defaultValues: {
      password: "",
      username: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: z.infer<typeof WarehouseUserSignInFormSchema>) {
    startTransition(async () => {
      try {
        // 💡 Use the new warehouse login action
        const response = await loginWarehouseUser({
          data: {
            warehouseInfo: data.warehouseInfo,
            username: data.username,
            password: data.password,
          },
        });

        if (response?.response?.isSuccess) {
          setAccessToken(response.response.result.payload.accessToken);
          navigate(redirectUrl);
          toast.success("Login Successful!");
        } else {
          const error: any = response?.error;
          console.error(error);
          // 💡 Showing a user-friendly error message on toast for failed login
          toast.error(
            "Login Failed: " +
              (error.message || "Please check your credentials.")
          );
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} typeof="POST">
          <div className="grid gap-3">
            {/* Removed redundant 'Warehouse ID or alias' field */}
            <FormField
              control={form.control}
              name="warehouseInfo"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-1">
                    <FormLabel
                      htmlFor="warehouseInfo"
                      className="text-base font-bold"
                    >
                      Warehouse Info
                    </FormLabel>
                    <Input
                      placeholder="Enter warehouse"
                      disabled={isLoading}
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-1">
                    <FormLabel
                      htmlFor="username"
                      className="text-base font-bold"
                    >
                      Username or Email
                    </FormLabel>
                    <Input
                      placeholder="Enter username or email"
                      disabled={isLoading}
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-1">
                    <FormLabel
                      htmlFor="password"
                      className="text-base font-bold"
                    >
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-3">
                  <FormControl>
                    {/* Assuming Checkbox component exists */}
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              disabled={isLoading}
              type="submit"
              className="py-6 text-lg font-semibold"
            >
              {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
