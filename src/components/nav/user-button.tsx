import { LogOut, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { useAuthStore } from "@/store/authStore";
import { useTransition } from "react";
import { useNavigate } from "react-router-dom";

export function UserButton() {
  const { logout, setProfileSheetOpen } = useAuthStore((state) => state);
  const navigate = useNavigate();
  const [isLoading, startTransition] = useTransition();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <UserIcon className="size-[1.2rem]" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setProfileSheetOpen(true);
              }}
            >
              <UserIcon className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <ChangePasswordButton
                changePasswordAction={async (oldPassword, password) => {
                  let response;
                  if (user) {
                    if (user.role) {
                      response = await changePasswordStaff({
                        version: user.version,
                        oldPassword,
                        password,
                      });
                    } else {
                      response = await changePasswordAdmin({
                        version: user.version,
                        oldPassword,
                        password,
                      });
                    }
                    if (response?.response?.isSuccess) {
                      toast.success("Password updated successfully");
                    } else {
                      setError(response?.error as ErrorResponse);
                    }
                  }
                }}
              />
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoading}
            onClick={() => {
              startTransition(async () => {
                await logout();
                navigate("/");
              });
            }}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
