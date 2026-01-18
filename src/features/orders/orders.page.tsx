/* eslint-disable react-refresh/only-export-components */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Link, useNavigate } from "react-router";
import { OrderStatus } from "./order.response";
import { getOrders, getOrderStats } from "./orders.action";

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "Success":
      return {
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    case "Pending":
      return {
        color: "bg-amber-50 text-amber-700 border-amber-100",
        icon: <Clock className="w-3 h-3" />,
      };
    case "Cancelled":
      return {
        color: "bg-red-50 text-red-700 border-red-100",
        icon: <XCircle className="w-3 h-3" />,
      };
    default:
      return {
        color: "bg-slate-50 text-slate-600 border-slate-100",
        icon: <Package className="w-3 h-3" />,
      };
  }
};

export default function OrdersPage({ isCustomer }: { isCustomer: boolean }) {
  const [search, setSearch] = useState("");
  const query = useDebounce(search, 400);
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["orders-stats", dateFilter, dateRange, isCustomer],
    queryFn: () =>
      getOrderStats({
        dateFilter,
        from:
          dateFilter === "custom" ? dateRange?.from?.toISOString() : undefined,
        to: dateFilter === "custom" ? dateRange?.to?.toISOString() : undefined,
        isCustomer,
      }),
  });
  const stats = statsResponse?.response?.data;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        "orders",
        query,
        dateFilter,
        statusFilter,
        dateRange,
        isCustomer,
      ],
      queryFn: ({ pageParam }) =>
        getOrders({
          after: pageParam ?? undefined,
          q: query,
          size: "30",
          dateFilter,
          from:
            dateFilter === "custom"
              ? dateRange?.from?.toISOString()
              : undefined,
          to:
            dateFilter === "custom" ? dateRange?.to?.toISOString() : undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          isCustomer,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.response?.pagination?.hasNextPage
          ? lastPage.response.pagination.nextCursor
          : undefined,
    });

  const orders =
    data?.pages
      .filter((item) => item.response?.data)
      .flatMap((page) => page.response!.data) ?? [];
  const loadMoreRef = useRef<HTMLTableDataCellElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
        fetchNextPage();
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden px-6">
      {/* --- COMPACT HEADER --- */}
      <div className="bg-white border-b px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between z-20 rounded-t-xl gap-3">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <h1 className="text-lg md:text-xl font-black tracking-tight">
            Orders
          </h1>
          <div className="h-6 w-[1px] bg-slate-200 hidden xs:block" />

          {/* Date Filters: Scrollable on mobile */}
          <div className="flex bg-slate-100 p-1 rounded-lg items-center overflow-x-auto no-scrollbar max-w-full">
            <div className="flex items-center">
              {["today", "yesterday", "this_week", "all"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDateFilter(t)}
                  className={`px-3 py-1 text-[10px] md:text-[11px] font-bold rounded-md transition-all capitalize whitespace-nowrap ${
                    dateFilter === t
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setDateFilter("custom")}
                    className={`px-3 py-1 text-[10px] md:text-[11px] font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                      dateFilter === "custom"
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span>Custom</span>
                    {/* Hide specific dates on very small screens to save space */}
                    {dateFilter === "custom" && dateRange?.from && (
                      <span className="hidden md:inline-block text-[9px] opacity-60 font-medium border-l pl-2 border-slate-200">
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {dateRange.to ? format(dateRange.to, "LLL dd") : ""}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl shadow-2xl border-none"
                  align="end"
                >
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      if (range?.from && range?.to) setDateFilter("custom");
                    }}
                    numberOfMonths={window.innerWidth > 768 ? 2 : 1} // Responsive calendar months
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          className="rounded-lg font-bold gap-2 h-9 w-full sm:w-auto justify-center"
          asChild
        >
          <Link to="/pos">
            <ShoppingBag className="w-4 h-4" />
            <span className="inline">New Order</span>
          </Link>
        </Button>
      </div>

      {/* --- COMPACT STATS STRIP --- */}
      {/* Change: grid-cols-2 on mobile, grid-cols-4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 px-4 md:px-6 py-3 bg-white border-b">
        {[
          {
            label: "Total",
            count: stats?.totalOrders,
            rev: stats?.totalRevenue,
            color: "text-blue-600",
          },
          {
            label: "Pending",
            count: stats?.totalPendingOrders,
            rev: stats?.totalPendingRevenue,
            color: "text-amber-600",
          },
          {
            label: "Unpaid",
            count: stats?.totalUnpaidOrders,
            rev: stats?.totalUnpaidRevenue,
            color: "text-rose-600",
          },
          {
            label: "Paid",
            count: stats?.totalPaidOrders,
            rev: stats?.totalPaidRevenue,
            color: "text-emerald-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex flex-col pr-4 ${
              i % 2 === 0 ? "border-r" : "lg:border-r" // Border logic for 2x2 mobile grid
            } last:border-none border-slate-100`}
          >
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5">
              {s.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-base md:text-lg font-black leading-none ${s.color}`}
              >
                {s.count?.toLocaleString() || "0"}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                Orders
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                {s.rev?.toLocaleString() || "0"}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase">
                Ks
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- FILTER BAR --- */}
      <div className="px-4 md:px-6 py-3 bg-white border-b flex flex-col md:flex-row items-stretch md:items-center gap-3 rounded-b-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search orders..."
            className="pl-9 h-9 rounded-lg bg-slate-50 border-none text-xs w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs: Horizontal scrollable for many statuses */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full md:w-auto overflow-x-auto no-scrollbar"
        >
          <TabsList className="bg-slate-100 h-9 p-1 rounded-lg w-max flex">
            <TabsTrigger
              value={"all"}
              className="text-[11px] font-bold px-4 h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              All
            </TabsTrigger>
            {Object.values(OrderStatus).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="text-[11px] font-bold px-4 h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary"
              >
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* --- SCROLLABLE TABLE AREA --- */}
      <div className="flex-1 overflow-hidden relative py-4">
        <Card className="h-full rounded-xl border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white p-0">
          <div className="overflow-auto flex-1 no-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">
                    Order & Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-right">
                    Amount
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => {
                  const status = getStatusConfig(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (isCustomer) {
                          navigate("/orders/" + order.id);
                        } else {
                          navigate("/purchase-orders/" + order.id);
                        }
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900 text-sm italic">
                          #{order.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-slate-600">
                        {order.customer?.name ?? (
                          <span className="text-slate-300 font-normal">
                            Walk-in
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          className={`rounded-md px-2 py-0.5 border shadow-none font-bold text-[9px] uppercase mx-auto flex items-center gap-1 w-fit ${status.color}`}
                        >
                          {status.icon} {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="font-black text-slate-900 text-sm">
                          {order.totals.payable.toLocaleString()}{" "}
                          <span className="text-[9px] text-slate-400 uppercase">
                            Ks
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">
                          {order.items.length}
                          units
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right w-20">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            asChild
                          >
                            <Link to={"/orders/" + order.id}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Loader Trigger */}
                {hasNextPage && (
                  <tr>
                    <td
                      colSpan={5}
                      ref={loadMoreRef}
                      className="p-8 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Loading...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
