import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

// Recharts for the Graph
import DatePicker from "@/components/ui/date-picker";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useState } from "react";
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { getOrders } from "../orders/orders.action";
import PosPage from "../pos/pos.page";
import {
  getDashboardStats,
  getDebt,
  getPayments,
  getWeeklyStats,
} from "./dashboard.action";

// --- Mock Data ---

// --- Dashboard Component ---

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [fromDate, setFromDate] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", fromDate, toDate],
    queryFn: async () => {
      if (!fromDate || !toDate) return null;
      const data = await getDashboardStats({ from: fromDate, to: toDate });
      if (data.response) return data.response;
      throw data.error;
    },
    enabled: !!fromDate && !!toDate,
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ["dashboard-weekly-stats", fromDate, toDate],
    queryFn: async () => {
      if (!fromDate || !toDate) return null;
      const data = await getWeeklyStats({ from: fromDate, to: toDate });
      if (data.response) return data.response;
      throw data.error;
    },
    enabled: !!fromDate && !!toDate,
  });

  const { data: debts } = useQuery({
    queryKey: ["dashboard-debts", fromDate, toDate],
    queryFn: async () => {
      if (!fromDate || !toDate) return null;
      const data = await getDebt({ from: fromDate, to: toDate });
      if (data.response) return data.response;
      throw data.error;
    },
    enabled: !!fromDate && !!toDate,
  });

  const { data } = useInfiniteQuery({
    queryKey: ["orders", fromDate, toDate],
    queryFn: ({ pageParam }) =>
      getOrders({
        after: pageParam ?? undefined,
        size: "30",
        dateFilter: "custom",
        from: fromDate?.toISOString(),
        to: toDate?.toISOString(),
        status: "",
        isCustomer: true,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.response?.pagination?.hasNextPage
        ? lastPage.response.pagination.nextCursor
        : undefined,
  });

  const ordersList =
    data?.pages.flatMap((page) => page.response?.data || []) || [];

  const { data: paymentsData } = useQuery({
    queryKey: ["dashboard-payments", fromDate, toDate],
    queryFn: async () => {
      if (!fromDate || !toDate) return null;
      const data = await getPayments({ from: fromDate, to: toDate });
      if (data.response) return data.response;
      throw data.error;
    },
    enabled: !!fromDate && !!toDate,
  });

  // const { data: lowStocks } = useQuery({
  //   queryKey: ["dashboard-low-stocks", fromDate, toDate],
  //   queryFn: async () => {
  //     if (!fromDate || !toDate) return null;
  //     const data = await getLowStocks({ from: fromDate, to: toDate });
  //     if (data.response) return data.response;
  //     throw data.error;
  //   },
  //   enabled: !!fromDate && !!toDate,
  // });

  if (!user?.isAdmin) {
    return <PosPage isCustomer={true} />;
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 pt-8 bg-slate-50/80 min-h-screen overflow-y-auto">
      {/* --- Page Header --- */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            ဆိုင်ဆိုင်ရာ အချက်အလက်များ (Shop Analytics Overview)
          </p>
        </div>
        <div className="flex items-center space-x-3 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
          <DatePicker value={fromDate} setValue={setFromDate} />
          <div className="text-slate-300">|</div>
          <DatePicker value={toDate} setValue={setToDate} />
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">
              ရောင်းရငွေ (Revenue)
            </CardTitle>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-3xl font-black">
              {stats?.revenue?.toLocaleString() ?? "0"} Ks
            </div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue in selected period</span>
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Debt */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-rose-500 to-red-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">
              ရရန်ရှိ (Debt)
            </CardTitle>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-3xl font-black">
              {stats?.debt?.toLocaleString() ?? "0"} Ks
            </div>
            <p className="text-xs text-rose-100 mt-2 flex items-center gap-1 font-medium">
              <Users className="h-3 w-3" />
              <span>Total outstanding balance</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">
              အော်ဒါ (Orders)
            </CardTitle>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-3xl font-black">
              {stats?.orders?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Count of orders made</span>
            </p>
          </CardContent>
        </Card>

        {/* Owned/Total */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">
              ပေးရန်ကျန်ရှိငွေ
            </CardTitle>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-3xl font-black">
              {stats?.owned?.toLocaleString() ?? "0"} Ks
            </div>
            <p className="text-xs text-violet-100 mt-2 flex items-center gap-1 font-medium">
              <Package className="h-3 w-3" />
              <span>Estimated stock value</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Weekly Stats + Payment Pie */}
        <div className="col-span-4 space-y-8">
          {/* Weekly Overview */}
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    အပတ်စဉ် အရောင်းစာရင်း
                  </CardTitle>
                  <CardDescription>Weekly sales & order trends</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 px-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={weeklyStats?.map((w) => ({
                      name: new Date(w.date).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      }),
                      revenue: w.noOfRevenues,
                      orders: w.noOfOrders,
                    }))}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5e1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#cbd5e1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#cbd5e1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartTooltip
                      cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                      contentStyle={{
                        borderRadius: "20px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        padding: "12px 16px",
                      }}
                      formatter={(v: number, n: string) => [
                        n === "revenue"
                          ? `${v.toLocaleString()} Ks`
                          : `${v} Orders`,
                        n.charAt(0).toUpperCase() + n.slice(1),
                      ]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#f43f5e"
                      strokeWidth={4}
                      dot={{
                        fill: "#f43f5e",
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border-none shadow-xl bg-white rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-600" />
                ငွေပေးချေမှုပုံစံများ
              </CardTitle>
              <CardDescription>Revenue distribution by method</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-8 items-center pt-2">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentsData?.map((p) => ({
                        name: p.paymentMethod.name,
                        value: p.amount,
                      }))}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentsData?.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={
                            [
                              "#6366f1",
                              "#10b981",
                              "#f59e0b",
                              "#f43f5e",
                              "#0ea5e9",
                            ][i % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <RechartTooltip
                      formatter={
                        (value: number) => value.toLocaleString("en-US") // 12,345
                      }
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {paymentsData?.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#6366f1",
                            "#10b981",
                            "#f59e0b",
                            "#f43f5e",
                            "#0ea5e9",
                          ][i % 5],
                        }}
                      />
                      <span className="font-semibold text-sm text-slate-700">
                        {p.paymentMethod.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-500">
                      {((p.amount / (stats?.revenue || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Recent Orders & Debts */}
        <div className="col-span-3 space-y-8">
          {/* Recent Orders */}
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-5">
              <CardTitle className="text-xl font-bold">
                နောက်ဆုံးရောင်းအားများ
              </CardTitle>
              <CardDescription>Recent transactions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {ordersList.slice(0, 5).map((o, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-1 ring-slate-100">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${o.customer?.name || "WI"}`}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-bold">
                        {(o.customer?.name || "Walk-in")
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 leading-none">
                        {o.customer?.name || "Walk-in Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {o.receiptNo || o.id} •{" "}
                        {format(new Date(o.createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-black text-slate-900">
                      +{o.totals.payable.toLocaleString()} Ks
                    </p>
                    <Badge
                      variant={o.status === "Success" ? "default" : "secondary"}
                      className="text-[10px] px-2 py-0 h-5 rounded-lg border-none"
                    >
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Debt List */}
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100/50 pb-5">
              <CardTitle className="text-xl font-bold text-rose-700 flex items-center gap-2">
                <Users className="h-5 w-5" />
                အကြွေးစာရင်း
              </CardTitle>
              <CardDescription>Customers with pending balance</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {debts?.slice(0, 5).map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">
                        {d.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.customer.phoneNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600">
                        {d.amount.toLocaleString()} Ks
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {d.totalOrders.length} Orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
