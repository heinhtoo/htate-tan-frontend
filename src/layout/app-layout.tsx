/* eslint-disable @typescript-eslint/no-explicit-any */
import Footer from "@/components/footer";
import AppHeader from "@/components/nav/app-header";
import NavBreadcrumb from "@/components/nav/nav-breadcrumb";
import { UserButton } from "@/components/nav/user-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import OrderTabs from "@/features/pos/order-tabs.component";
import { useIsMobile } from "@/hooks/use-mobile";
import { isAdmin } from "@/lib/authHelper";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLayoutStore } from "@/store/layoutStore";
import { usePanelStore } from "@/store/panelStore";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { differenceInDays } from "date-fns";
import {
  BanknoteArrowDown,
  BarChart3,
  Boxes,
  CarIcon,
  ChevronsUpDown,
  Codesandbox,
  Cog,
  CreditCard,
  DownloadIcon,
  ImageIcon,
  LayoutDashboard,
  LockIcon, // New icon for POS
  Package,
  PackageOpen,
  Scale,
  ShapesIcon, // Renamed from SquareTerminal
  ShoppingCart, // New icon for Inventory
  Store,
  UserCog, // New icon for Reports
  Users,
} from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Panel from "./panel";
import { QRButton } from "./qr-button";
export type NavLink = {
  name: string;
  url: string;
  icon: React.ReactNode;
};

export default function AppLayout() {
  const { user } = useAuthStore((state) => state);

  const location = useLocation();
  const pathname = location.pathname;
  const { isOpen } = useLayoutStore((state) => state);
  const isMobile = useIsMobile(); // 💡 UPDATED DATA STRUCTURE FOR RETAIL POS

  const data = {
    user: {
      name: user?.username,
      email: user?.warehouse.name,
      avatar: "https://github.com/shadcn.png",
    },
    navList: [
      {
        key: "Sales & POS",
        isCollapsible: false,
        isAdminOnly: false,
        list: [
          {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboard,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Point of Sale (POS)",
            url: "/pos",
            icon: ShoppingCart,
            addedDate: new Date(2025, 10, 30),
          },
          {
            title: "Order History",
            url: "/orders",
            icon: BarChart3,
            addedDate: new Date(2025, 1, 28),
          },
        ],
      },
      {
        key: "Inventory & Products",
        isCollapsible: false,
        isAdminOnly: true,
        list: [
          {
            title: "Products",
            url: "/products",
            icon: PackageOpen,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Product Groups",
            url: "/product-groups",
            icon: Package,
            addedDate: new Date(2025, 11, 1),
          },
          // {
          //   title: "Stock & Inventory",
          //   url: "/inventory",
          //   icon: Store,
          //   addedDate: new Date(2025, 1, 28),
          // },
          // {
          //   title: "Stock History",
          //   url: "/stock-history",
          //   icon: DownloadIcon,
          //   addedDate: new Date(2025, 11, 1),
          // },
          {
            title: "Warehouse / Store",
            url: "/warehouses",
            icon: Store,
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
      {
        key: "Purchasing & Suppliers",
        isCollapsible: true,
        isAdminOnly: true,
        list: [
          {
            title: "Purchase POS",
            url: "/purchase-pos",
            icon: DownloadIcon,
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Purchase Orders",
            url: "/purchase-orders",
            icon: DownloadIcon,
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Suppliers",
            url: "/suppliers",
            icon: Users,
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
      {
        key: "People",
        isCollapsible: true,
        isAdminOnly: true,

        list: [
          {
            title: "Customer List",
            url: "/customers",
            icon: Users,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Staff",
            url: "/staff",
            icon: UserCog,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Admin Users",
            url: "/admin-users",
            icon: LockIcon,
            addedDate: new Date(2025, 11, 1),
          },
          // {
          //   title: "Loyalty Levels",
          //   url: "/loyalty-levels",
          //   icon: BarChart3,
          //   addedDate: new Date(2025, 11, 1),
          // },
        ],
      },
      {
        key: "Reports & Finance",
        isCollapsible: true,
        isAdminOnly: true,

        list: [
          {
            title: "Financial Reports",
            url: "/reports/finance",
            icon: BarChart3,
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
    ],
    configuration: [
      {
        title: "Media",
        url: "/media",
        icon: ImageIcon,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Product Categories",
        url: "/product-categories",
        icon: ShapesIcon,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Product Type",
        url: "/product-type",
        icon: Boxes,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Brands",
        url: "/brands",
        icon: Codesandbox,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Payment Methods",
        url: "/payment-methods",
        icon: CreditCard,
        addedDate: new Date(2025, 1, 28),
      },
      {
        title: "Other Charges",
        url: "/other-charges",
        icon: BanknoteArrowDown,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Unit Conversions",
        url: "/unit-conversions",
        icon: Scale,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Car Gate",
        url: "/car-gate",
        icon: CarIcon,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "General Settings",
        url: "/settings",
        icon: Cog,
        addedDate: new Date(2025, 1, 28),
      },
    ],
  };

  const { isPanelOpen } = usePanelStore();
  return (
    <SidebarProvider className="overflow-hidden">
      {/* The rest of the component structure remains the same, 
          using the updated 'data' object for navigation links. */}
      <Sidebar collapsible="offcanvas" className="overscroll-none">
        <AppHeader />
        <SidebarContent className="overflow-y-scroll scrollbar-hide">
          {data.navList
            .filter((item) =>
              isAdmin(user) ? true : item.isAdminOnly === false,
            )
            .map((nav, index) => {
              return (
                <SidebarGroup key={"nav-list-" + index}>
                  <Collapsible
                    defaultOpen={
                      !nav.isCollapsible ||
                      nav.list.find((item) => pathname.includes(item.url))
                        ? true
                        : false
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        className="flex w-full justify-between p-0 hover:bg-gray-50 hover:text-gray-800"
                        size={"sm"}
                        variant={"ghost"}
                      >
                        <SidebarGroupLabel className="pointer-events-none">
                          {nav.key}
                        </SidebarGroupLabel>
                        <ChevronsUpDown className="mr-3 text-gray-400" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu>
                        {nav.list.map((item: any) => (
                          <SidebarMenuButton
                            tooltip={item.title}
                            key={item.title}
                            className={
                              item.url === "/"
                                ? pathname === "/"
                                  ? "bg-primary/10 text-gray-800"
                                  : "opacity-70"
                                : pathname.startsWith(item.url)
                                  ? "bg-primary/10 text-gray-800"
                                  : "opacity-70"
                            }
                            asChild
                          >
                            <Link
                              to={item.url}
                              className="flex flex-row items-center px-4 py-2.5"
                            >
                              {item.icon && (
                                <item.icon className="pointer-events-none h-4 w-4" />
                              )}
                              <div className="flex grow flex-row items-center justify-between">
                                <span className="whitespace-nowrap">
                                  {item.title}
                                </span>
                                {differenceInDays(new Date(), item.addedDate) <=
                                  30 && (
                                  <Badge className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0 text-[0.5rem] text-primary">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarGroup>
              );
            })}
          {isAdmin(user) && (
            <SidebarGroup>
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger asChild>
                  <Button
                    className="flex w-full justify-between p-0 hover:bg-gray-50 hover:text-gray-800"
                    size={"sm"}
                    variant={"ghost"}
                  >
                    <SidebarGroupLabel className="pointer-events-none">
                      Configuration
                    </SidebarGroupLabel>
                    <ChevronsUpDown className="mr-3 text-gray-400" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu>
                    {data.configuration.map((item) => (
                      <SidebarMenuButton
                        tooltip={item.title}
                        key={item.title}
                        className={
                          item.url === "/"
                            ? pathname === "/"
                              ? "bg-primary/10 text-gray-800"
                              : "opacity-70"
                            : pathname.startsWith(item.url)
                              ? "bg-primary/10 text-gray-800"
                              : "opacity-70"
                        }
                        asChild
                      >
                        <Link
                          to={item.url}
                          className="flex flex-row items-center px-4 py-2.5"
                        >
                          {item.icon && (
                            <item.icon className="pointer-events-none h-4 w-4" />
                          )}
                          <div className="flex grow flex-row items-center justify-between">
                            <span className="whitespace-nowrap">
                              {item.title}
                            </span>
                            {differenceInDays(new Date(), item.addedDate) <=
                              30 && (
                              <Badge className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0 text-[0.5rem] text-primary">
                                New
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="border-t text-xs group-data-[collapsible=icon]:hidden">
          <span className="flex flex-row items-center justify-center gap-1.5 text-center text-sm">
            v {import.meta.env.VITE_VERSION}
            <Badge className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0 text-[0.5rem] text-primary">
              Latest
            </Badge>
          </span>
          <Footer isWhite={true} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset
        className={cn(
          "text-gray-900 transition-all flex flex-col overflow-scroll h-screen scrollbar-hide",
          isMobile === false && isOpen ? "ml-[17rem]" : "",
        )}
      >
        {pathname.includes("pos") ? (
          <OrderTabs isCustomer={!pathname.includes("purchase-pos")} />
        ) : (
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 text-gray-400" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NavBreadcrumb />
            </div>
            <div className="flex flex-row items-center gap-3 px-4">
              {/* Necessary buttons */}
              <UserButton />
              <QRButton />
            </div>
          </header>
        )}
        <main
          className={cn(
            "relative flex h-full transition-all duration-300",
            // 💡 Adjust the width of the main content when the panel is open
            isPanelOpen ? "md:mr-[400px] flex-col" : "flex-col",
            pathname.includes("/settings")
              ? "sm:overflow-y-auto"
              : "sm:overflow-y-hidden",
          )}
        >
          <Outlet />
          <Panel />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
