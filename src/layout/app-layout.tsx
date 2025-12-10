/* eslint-disable @typescript-eslint/no-explicit-any */
import Footer from "@/components/footer";
import AppHeader from "@/components/nav/app-header";
import NavBreadcrumb from "@/components/nav/nav-breadcrumb";
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
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { isAdmin } from "@/lib/authHelper";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLayoutStore } from "@/store/layoutStore";
import { usePanelStore } from "@/store/panelStore";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { differenceInDays } from "date-fns";
import {
  BarChart3,
  ChevronsUpDown,
  CogIcon,
  CreditCard,
  DownloadIcon,
  ImageIcon,
  LayoutDashboard,
  LockIcon, // New icon for POS
  Package,
  Scale, // Renamed from SquareTerminal
  ShoppingCart, // New icon for Inventory
  Store, // New icon for Reports
  Users,
} from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Panel from "./panel";
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
            icon: ShoppingCart, // Used for POS
            addedDate: new Date(2025, 10, 30),
          },
          {
            title: "Order History", // 🎯 Entity: order
            url: "/orders",
            icon: BarChart3,
            addedDate: new Date(2025, 1, 28),
          },
          // 💡 Removed generic "Reports" here, consolidated under a dedicated Reports module
        ],
      },
      {
        key: "Inventory & Products",
        isCollapsible: false,
        list: [
          {
            title: "Products", // 🎯 Entity: product
            url: "/products",
            icon: Package,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Stock & Inventory", // 🎯 Entity: stock
            url: "/inventory",
            icon: DownloadIcon, // Icon for stock (download/tracking)
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Stock History", // 🎯 Entity: stock history
            url: "/stock-history",
            icon: DownloadIcon, // Reusing icon, maybe use a different one if available
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Warehouse / Store", // 🎯 Entity: warehouse
            url: "/warehouses",
            icon: Store, // Icon for physical locations
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
      {
        key: "Purchasing & Suppliers", // 🚀 NEW PRIMARY MODULE
        isCollapsible: true,
        list: [
          {
            title: "Purchase Orders", // 🎯 Entity: purchase
            url: "/purchases",
            icon: DownloadIcon, // Icon for incoming goods
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Suppliers", // 🎯 Entity: supplier
            url: "/suppliers",
            icon: Users, // Can reuse Users icon for external partners
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
      {
        key: "People & Loyalty", // 👥 Renamed to better encompass all users
        isCollapsible: true,
        list: [
          {
            title: "Customer List", // 🎯 Entity: customer
            url: "/customers",
            icon: Users,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Staff", // 🎯 Entity: staff
            url: "/staff",
            icon: Users,
            addedDate: new Date(2025, 1, 28),
          },
          {
            title: "Loyalty Levels", // 🎯 Entity: loyalty level
            url: "/loyalty-levels",
            icon: BarChart3, // Using this for levels/tiers
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
      {
        key: "Reports & Finance", // 📊 NEW PRIMARY MODULE
        isCollapsible: true,
        list: [
          {
            title: "Financial Reports", // Draws from Payment/Order/Purchase
            url: "/reports/finance",
            icon: BarChart3,
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Payments", // 🎯 Entity: payment
            url: "/payments",
            icon: CreditCard,
            addedDate: new Date(2025, 11, 1),
          },
          {
            title: "Receipts", // 🎯 Entity: receipt
            url: "/receipts",
            icon: DownloadIcon,
            addedDate: new Date(2025, 11, 1),
          },
        ],
      },
    ],
    configuration: [
      {
        title: "Admin Users", // 🎯 Entity: admin
        url: "/admin-users",
        icon: LockIcon,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Media", // 🎯 Entity: admin
        url: "/media",
        icon: ImageIcon,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Product Categories", // 🎯 Entity: category
        url: "/product-categories",
        icon: Package,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Product Groups", // 🎯 Entities: product group, product type
        url: "/product-groups",
        icon: Package,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Product Type", // 🎯 Entities: product group, product type
        url: "/product-type",
        icon: Package,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Brands", // 🎯 Entity: brand
        url: "/brands",
        icon: Package,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Payment Methods", // 🎯 Entity: payment type
        url: "/payment-methods",
        icon: CreditCard,
        addedDate: new Date(2025, 1, 28),
      },
      {
        title: "Other Charges", // 🎯 Entity: other charge
        url: "/other-charges",
        icon: Scale, // Use Scale for financial charges/fees
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Unit Conversions", // 🎯 Entity: unit conversion
        url: "/unit-conversions",
        icon: Scale,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "Car Gate", // 🎯 Entity: car-gate
        url: "/car-gate",
        icon: Store,
        addedDate: new Date(2025, 11, 1),
      },
      {
        title: "General Settings", // 🎯 Entity: settings
        url: "/settings",
        icon: CogIcon,
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
        {user?.isAdmin ? (
          <AppHeader />
        ) : (
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-none p-4 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {/* // TODO add avatar */}
                  {/* Existing Warehouse/User details removed for brevity, 
                  but you should customize this for your aunt's store name/logo */}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        )}
        <SidebarContent className="overflow-y-scroll scrollbar-hide">
          {data.navList.map((nav, index) => {
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
          isMobile === false && isOpen ? "ml-[17rem]" : ""
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-gray-400" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NavBreadcrumb />
          </div>
          <div className="flex flex-row items-center gap-3 px-4">
            {/* Necessary buttons */}
          </div>
        </header>
        <main
          className={cn(
            "relative flex h-full transition-all duration-300",
            // 💡 Adjust the width of the main content when the panel is open
            isPanelOpen ? "md:mr-[400px] flex-col" : "flex-col",
            pathname.includes("/settings")
              ? "sm:overflow-y-auto"
              : "sm:overflow-y-hidden"
          )}
        >
          <Outlet />
          <Panel />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
