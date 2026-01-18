import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import {
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

// Recharts for the Graph
import {
  Bar,
  BarChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import PosPage from "../pos/pos.page";

// --- Mock Data ---

const graphData = [
  { name: "Mon", total: 150000 },
  { name: "Tue", total: 230000 },
  { name: "Wed", total: 180000 },
  { name: "Thu", total: 280000 },
  { name: "Fri", total: 200000 },
  { name: "Sat", total: 350000 },
  { name: "Sun", total: 120000 },
];

const debtList = [
  {
    id: 1,
    name: "Mg Mg",
    amount: 45000,
    due: "2 Days ago",
    phone: "09977123123",
  },
  { id: 2, name: "Daw Hla", amount: 120000, due: "Today", phone: "0977889900" },
  {
    id: 3,
    name: "Ko Tun",
    amount: 15000,
    due: "Tomorrow",
    phone: "09250112233",
  },
  {
    id: 4,
    name: "Ma Mya",
    amount: 8500,
    due: "In 3 Days",
    phone: "0944556677",
  },
];

const lowStockItems = [
  { id: 1, name: "Coca Cola", stock: 5, min: 20 },
  { id: 2, name: "Coffee Mix", stock: 12, min: 50 },
  { id: 3, name: "Sunflower Oil", stock: 2, min: 10 },
  { id: 4, name: "Rice Bag (5kg)", stock: 3, min: 15 },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Walk-in",
    total: 15000,
    status: "completed",
    time: "10:00 AM",
  },
  {
    id: "ORD-002",
    customer: "Mg Mg",
    total: 45000,
    status: "pending",
    time: "10:15 AM",
  },
  {
    id: "ORD-003",
    customer: "Walk-in",
    total: 2300,
    status: "completed",
    time: "10:30 AM",
  },
  {
    id: "ORD-004",
    customer: "Ko Tun",
    total: 55000,
    status: "cancelled",
    time: "11:00 AM",
  },
  {
    id: "ORD-005",
    customer: "Daw Hla",
    total: 12000,
    status: "completed",
    time: "11:20 AM",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user?.isAdmin) {
    return <PosPage isCustomer={true} />;
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
      {/* --- Page Header --- */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            ဆိုင်ဆိုင်ရာ အချက်အလက်များ ကြည့်ရှုရန် (Overview of your shop)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>

      {/* --- KPI Cards (Top Row) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              စုစုပေါင်း ရောင်းရငွေ (Revenue)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,231,000 Ks</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Debt */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ရရန်ရှိ အကြွေး (Debt)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">188,500 Ks</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
              +4% from last week
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              အရောင်းအော်ဒါ (Orders)
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              +12 since last hour
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ပစ္စည်းပြတ်ခါနီး (Low Stock)
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Items</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Middle Section: Charts & Recent Sales --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart (Takes up 4 columns) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>အပတ်စဉ် အရောင်းစာရင်း (Weekly Overview)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <RechartTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} Ks`,
                      "Sales",
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales List (Takes up 3 columns) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>နောက်ဆုံးရောင်းအားများ</CardTitle>
            <CardDescription>Recent Sales Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order, index) => (
                <div className="flex items-center" key={index}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>
                      {order.customer.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.id} • {order.time}
                    </p>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <div className="font-medium">
                      +{order.total.toLocaleString()} Ks
                    </div>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px] px-1 py-0 h-4 mt-1"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Bottom Section: Debt & Stock Info --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 pb-20">
        {/* Debt List */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Users className="h-5 w-5" />
                အကြွေးစာရင်း (Debt List)
              </CardTitle>
              <CardDescription>Customers who owe payment</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtList.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">
                      {debt.name}
                      <div className="text-xs text-muted-foreground">
                        {debt.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{debt.due}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {debt.amount.toLocaleString()} Ks
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock / Purchase Orders */}
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                ပစ္စည်းဖြည့်ရန် (Low Stock)
              </CardTitle>
              <CardDescription>Items below reorder level</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              Create PO
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="text-orange-600 font-bold mr-1">
                        {item.stock} left
                      </span>
                      <span>(Min: {item.min})</span>
                    </div>
                    <Progress
                      value={(item.stock / item.min) * 100}
                      className="h-2 bg-orange-100"
                      // Note: You might need a custom class/component to color the indicator inside Progress
                    />
                  </div>
                  <Button size="sm" variant="secondary">
                    Order
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
