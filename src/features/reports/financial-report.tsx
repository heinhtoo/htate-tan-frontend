import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  Banknote,
  CreditCard,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFinancialReport } from "./reports.action";

function FinancialReport() {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["financial-report", fromDate, toDate],
    queryFn: async () => {
      if (!fromDate || !toDate) return null;
      const data = await getFinancialReport({ from: fromDate, to: toDate });
      if (data.response) return data.response;
      throw data.error;
    },
    enabled: !!fromDate && !!toDate,
  });

  // --- Data Calculations ---
  const totalCollected =
    reportData?.reduce((acc, daily) => {
      return (
        acc + daily.paymentMethods.reduce((pAcc, p) => pAcc + p.totalAmount, 0)
      );
    }, 0) || 0;

  const totalUnpaid =
    reportData?.reduce((acc, daily) => {
      return acc + daily.unpaid.totalAmount;
    }, 0) || 0;

  const paymentMethodsMix = reportData?.reduce(
    (acc: { name: string; value: number }[], daily) => {
      daily.paymentMethods.forEach((pm) => {
        const existing = acc.find((a) => a.name === pm.methodName);
        if (existing) {
          existing.value += pm.totalAmount;
        } else {
          acc.push({ name: pm.methodName, value: pm.totalAmount });
        }
      });
      return acc;
    },
    [],
  );

  const chartData = reportData?.map((daily) => ({
    date: format(new Date(daily.date), "MMM dd"),
    collected: daily.paymentMethods.reduce((acc, p) => acc + p.totalAmount, 0),
    debt: daily.unpaid.totalAmount,
  }));

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-slate-50/50 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-600" />
            Financial Report
          </h2>
          <p className="text-muted-foreground text-lg">
            အရောင်းနှင့် ငွေရရှိမှု အစီရင်ခံစာ (Collections & Receivables)
          </p>
        </div>
        <div className="flex items-center space-x-3 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100">
          <DatePicker value={fromDate} setValue={setFromDate} />
          <div className="text-slate-300">|</div>
          <DatePicker value={toDate} setValue={setToDate} />
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Banknote className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-widest">
              ငွေသားရရှိမှု (Total Collected)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-4xl font-black">
              {totalCollected.toLocaleString()} Ks
            </div>
            <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Payments received in this period</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-rose-500 to-red-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-widest">
              ရရန်ကျန်ရှိ (Account Receivable)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-4xl font-black">
              {totalUnpaid.toLocaleString()} Ks
            </div>
            <p className="text-xs text-rose-100 mt-2 flex items-center gap-1 font-medium">
              <TrendingDown className="h-3 w-3" />
              <span>Unpaid balance from transactions</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-widest">
              စုစုပေါင်းပမာဏ (Net Total)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="text-4xl font-black">
              {(totalCollected + totalUnpaid).toLocaleString()} Ks
            </div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Total business volume</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 pb-6">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Daily Collection Trends
            </CardTitle>
            <CardDescription>
              Daily comparison of payments vs debt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    stroke="#cbd5e1"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#cbd5e1"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      padding: "12px 16px",
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Bar
                    dataKey="collected"
                    name="Collected"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    barSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="debt"
                    name="Debt"
                    stroke="#f43f5e"
                    strokeWidth={4}
                    dot={{ fill: "#f43f5e", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 pb-6">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" />
              Payment Methods Mix
            </CardTitle>
            <CardDescription>
              Distribution of collection by bank/cash
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-8 items-center pt-8">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsMix}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentMethodsMix?.map((_, i) => (
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
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {paymentMethodsMix?.map((p, i) => (
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
                      {p.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-500">
                    {((p.value / (totalCollected || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Daily Breakdown */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 px-2 flex items-center gap-2">
          Daily Details Breakdown
        </h3>
        <div className="grid gap-4">
          {reportData?.filter((daily) => daily.unpaid.totalAmount > 0 || daily.paymentMethods.reduce((acc, b) => acc + b.totalAmount, 0) > 0).map((daily, idx) => (
            <Card
              key={idx}
              className="border-none shadow-md bg-white rounded-2xl overflow-hidden overflow-hidden"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${idx}`} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                    <div className="flex flex-1 items-center justify-between text-left pr-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-xl font-bold flex flex-col items-center justify-center min-w-[60px]">
                          <span className="text-xs uppercase opacity-70">
                            {format(new Date(daily.date), "MMM")}
                          </span>
                          <span className="text-xl">
                            {format(new Date(daily.date), "dd")}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {format(new Date(daily.date), "EEEE, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0"
                            >
                              Collected:{" "}
                              {daily.paymentMethods
                                .reduce((a, b) => a + b.totalAmount, 0)
                                .toLocaleString()}{" "}
                              Ks
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-rose-50 border-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0"
                            >
                              Debt: {daily.unpaid.totalAmount.toLocaleString()}{" "}
                              Ks
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 border-t border-slate-50">
                    <div className="grid lg:grid-cols-2 gap-8 mt-4">
                      {/* Payments Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Banknote className="h-4 w-4" /> Collections by Method
                        </h4>
                        <div className="space-y-3">
                          {daily.paymentMethods.filter((pm) => pm.totalAmount > 0).map((pm, pmIdx) => (
                            <div
                              key={pmIdx}
                              className="bg-slate-50 rounded-xl p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                <span className="font-bold text-slate-700">
                                  {pm.methodName}
                                </span>
                                <span className="font-black text-emerald-600">
                                  {pm.totalAmount.toLocaleString()} Ks
                                </span>
                              </div>
                              <div className="space-y-1">
                                {pm.orders.map((order, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="flex items-center justify-between text-xs py-1"
                                    onClick={() => {
                                      navigate("/orders/" + order.id);
                                    }}
                                  >
                                    <span className="text-slate-500">
                                      {order.receiptNo || `#${order.id}`} -{" "}
                                      {order.customerName || "Walk-in"}
                                    </span>
                                    <span className="font-semibold text-slate-700">
                                      {order.amountAffected.toLocaleString()} Ks
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unpaid Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Unpaid (Debts)
                        </h4>
                        <div className="bg-rose-50/30 rounded-xl p-4 space-y-3 border border-rose-100/50">
                          <div className="flex items-center justify-between border-b border-rose-200/50 pb-2">
                            <span className="font-bold text-rose-700">
                              Total Account Receivable
                            </span>
                            <span className="font-black text-rose-600">
                              {daily.unpaid.totalAmount.toLocaleString()} Ks
                            </span>
                          </div>
                          <div className="space-y-1">
                            {daily.unpaid.orders.map((order, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center justify-between text-xs py-1"
                              >
                                <span className="text-slate-500">
                                  {order.receiptNo || `#${order.id}`} -{" "}
                                  {order.customerName || "Walk-in"}
                                </span>
                                <span className="font-semibold text-rose-700">
                                  {order.amountAffected.toLocaleString()} Ks
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinancialReport;
