import { getRole, isAdmin } from "@/lib/authHelper";
import { useAuthStore } from "@/store/authStore";
import { ChevronsUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

function AppHeader() {
  const { user } = useAuthStore((state) => state);

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-md">
                  <AvatarImage src={"/assets/logo.png"} alt={"logo"} />
                  <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    {user?.warehouse.name}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.warehouse?.name}
                  </span>
                  <span className="truncate text-xs">{getRole(user)}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg p-0"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <div className="flex flex-col gap-5 p-3">
                <div className="flex flex-row items-center gap-3">
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage src={"/assets/logo.png"} alt={"logo"} />
                    <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                      {user?.warehouse.name}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.warehouse?.name}
                    </span>
                    <span className="truncate text-xs">{getRole(user)}</span>
                  </div>
                </div>
              </div>
              <Separator />
              {isAdmin(user) && (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 p-3 font-medium text-muted-foreground transition hover:font-semibold hover:text-primary"
                  asChild
                >
                  <Link to={"/warehouses"}>Add another warehouse</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export default AppHeader;
