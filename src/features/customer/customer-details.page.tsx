/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorStore } from "@/store/error.store";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Plus,
  ReceiptText,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useNavigate, useParams } from "react-router";
import { addPayments, getCustomerDetails } from "./customer.action";

const CustomerManagementSystem = () => {
  const { slug } = useParams();

  // 1. DATA FETCHING
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer-details", slug],
    queryFn: async () => {
      const res = await getCustomerDetails({ id: slug! });
      if (res.response) return res.response;
      throw new Error(res.error || ("Failed to fetch" as any));
    },
  });

  // 2. LOCAL STATES (Hydrated by useEffect)
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // 3. DIALOG & ALLOCATION STATE
  const [isOpen, setIsOpen] = useState(false);
  const [totalInput, setTotalInput] = useState<number>(0);
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  // Sync API data to local state for manipulation
  useEffect(() => {
    if (data) {
      // Map orders and calculate initial "remaining" balance
      const mappedOrders = data.orders.map((o: any) => {
        const payable =
          o.totalOrderAmount +
          o.totalOtherCharges -
          o.totalOrderDiscountAmount -
          o.totalAdditionalDiscountAmount;
        const payment = o.payments
          .filter(
            (item: any) =>
              item.status === "completed" || item.status === "unconfirmed"
          )
          .reduce(
            (acc: number, item: any) => Number(acc) + Number(item.amount),
            0
          );
        return {
          ...o,
          remaining: o.orderStatus === "Success" ? 0 : payable - payment,
        };
      });
      setOrders(mappedOrders);
      setPayments(data.payments || []);
    }
  }, [data]);

  // 4. COMPUTED VALUES
  const totalDebt = useMemo(
    () => orders.reduce((acc, curr) => acc + (curr.remaining || 0), 0),
    [orders]
  );
  const totalSpent = useMemo(
    () => orders.reduce((acc, curr) => acc + curr.totalOrderAmount, 0),
    [orders]
  );
  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((a, b) => a + b, 0),
    [allocations]
  );
  const remainingDebtAfterPayment = Math.max(0, totalDebt - totalInput);
  const { setError } = useErrorStore();

  // 5. AUTO-ALLOCATION LOGIC (FIFO)
  useEffect(() => {
    let remainingToDistribute = totalInput;
    const newAllocations: Record<number, number> = {};
    const sortedOrders = [...orders]
      .filter((o) => o.remaining > 0)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    sortedOrders.forEach((order) => {
      if (remainingToDistribute <= 0) {
        newAllocations[order.id] = 0;
      } else if (remainingToDistribute >= order.remaining) {
        newAllocations[order.id] = order.remaining;
        remainingToDistribute -= order.remaining;
      } else {
        newAllocations[order.id] = remainingToDistribute;
        remainingToDistribute = 0;
      }
    });
    setAllocations(newAllocations);
  }, [totalInput, orders, isOpen]);

  // 6. ACTION HANDLERS
  const handleConfirmPayment = () => {
    const newPaymentEntries = Object.entries(allocations)
      .filter(([_, amt]) => amt > 0)
      .map(([orderId, amt]) => ({
        id: Math.random().toString(36).substr(2, 9),
        orderId: parseInt(orderId),
        amount: amt.toString(),
        status: "completed",
        createdAt: new Date().toISOString(),
      }));

    startTransition(async () => {
      const { error } = await addPayments({
        id: slug!,
        payload: newPaymentEntries.map((item) => {
          const { id, ...otherData } = item;
          return otherData;
        }),
      });
      if (error) {
        setError(error as any);
      } else {
        setIsOpen(false);
        setTotalInput(0);
        refetch();
      }
    });
  };

  if (isLoading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading customer data.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 text-2xl font-bold uppercase">
              {data?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data?.name}
              </h1>
              <div className="flex items-center gap-3 text-slate-500 mt-1 font-medium text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {data?.township || "Unknown Location"}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>ID: {data?.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg px-8 py-6 text-md font-bold transition-all">
                <Plus className="w-5 h-5 mr-2" /> Receive Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Payment Allocation
                </DialogTitle>
                <DialogDescription>
                  Allocate lump sum payment to {data?.name}'s debt.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Amount Received
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="text-3xl h-20 rounded-2xl border-2 pl-14 font-black text-indigo-600 focus:border-indigo-500"
                      placeholder="0"
                      value={totalInput || ""}
                      onChange={(e) => setTotalInput(Number(e.target.value))}
                    />
                    <Wallet
                      className="absolute left-5 top-7 text-slate-300"
                      size={24}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Auto-Allocation List
                  </Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {orders
                      .filter((o) => o.remaining > 0)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                        >
                          <div className="text-sm">
                            <p className="font-bold text-slate-800">
                              Order #{order.id}
                            </p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase">
                              Due: {order.remaining.toLocaleString()} MMK
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <ArrowRight size={14} className="text-slate-300" />
                            <Input
                              type="number"
                              className="w-24 h-9 rounded-lg border-slate-200 text-right font-bold text-indigo-600"
                              value={allocations[order.id] || 0}
                              onChange={(e) =>
                                setAllocations({
                                  ...allocations,
                                  [order.id]: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl ${totalAllocated > totalInput ? "bg-red-50 text-red-600" : "bg-slate-900 text-white"} transition-colors`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase opacity-70 tracking-widest">
                      Outstanding Balance
                    </span>
                    <TrendingDown size={16} />
                  </div>
                  <p className="text-2xl font-black">
                    {remainingDebtAfterPayment.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={totalAllocated > totalInput || totalInput <= 0}
                  className="w-full h-14 rounded-2xl bg-indigo-600 text-lg font-bold shadow-xl"
                >
                  Confirm Allocation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Sales"
            value={totalSpent}
            color="text-slate-900"
          />
          <StatCard
            title="Balance Due"
            value={totalDebt}
            color="text-red-600"
            bgColor="bg-red-50/50"
          />
          <StatCard
            title="Credit Limit"
            value={Number(data?.creditLimit || 0)}
            color="text-slate-900"
          />
        </div>

        {/* TABS */}
        <Tabs
          defaultValue="orders"
          className="w-full flex flex-col gap-5 h-full"
        >
          <TabsList className="bg-slate-200/40 p-1.5 rounded-2xl">
            <TabsTrigger
              value="orders"
              className="rounded-xl px-8 font-bold data-[state=active]:shadow-md"
            >
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-xl px-8 font-bold data-[state=active]:shadow-md"
            >
              Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="overflow-y-auto max-h-[50vh]">
            <DataTable
              headers={["Date", "Order ID", "Status", "Remaining"]}
              data={orders}
              renderRow={(order: any) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-slate-50/50 border-slate-50"
                  onClick={() => {
                    navigate("/orders/" + order.id);
                  }}
                >
                  <TableCell className="py-5 pl-8 text-slate-500 text-sm font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    #ORD-{order.id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.remaining === 0 ? "default" : "secondary"}
                      className={order.remaining === 0 ? "bg-emerald-500" : ""}
                    >
                      {order.remaining === 0 ? "Fully Paid" : order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8 font-black text-slate-900">
                    {order.remaining.toLocaleString()} MMK
                  </TableCell>
                </TableRow>
              )}
            />
          </TabsContent>

          <TabsContent
            value="payments"
            className="overflow-y-auto max-h-[50vh]"
          >
            <DataTable
              headers={["Receipt", "Order Link", "Status", "Amount Paid"]}
              data={payments}
              renderRow={(p: any) => (
                <TableRow
                  key={p.id}
                  className="border-slate-50 hover:bg-slate-50/50"
                >
                  <TableCell className="py-5 pl-8 font-bold text-indigo-600 flex items-center gap-2 text-sm uppercase">
                    <ReceiptText size={16} /> PAY-{p.id.toString().slice(-4)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-500">
                    Order #{p.orderId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${p.status === "completed" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : ""}`}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8 font-black text-slate-900">
                    {Number(p.amount).toLocaleString()} MMK
                  </TableCell>
                </TableRow>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- SMALL HELPER COMPONENTS FOR CLEANER CODE ---
const StatCard = ({ title, value, color, bgColor = "bg-white" }: any) => (
  <Card
    className={`border-none shadow-xl shadow-slate-200/50 rounded-3xl p-2 ${bgColor}`}
  >
    <CardHeader className="pb-2">
      <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-black ${color}`}>
        {value.toLocaleString()}{" "}
        <span className="text-sm opacity-50 font-medium">MMK</span>
      </div>
    </CardContent>
  </Card>
);

const DataTable = ({ headers, data, renderRow }: any) => (
  <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow className="border-none">
          {headers.map((h: string, i: number) => (
            <TableHead
              key={h}
              className={`py-5 font-bold text-slate-500 ${i === 0 ? "pl-8" : ""} ${i === headers.length - 1 ? "text-right pr-8" : ""}`}
            >
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map(renderRow)
        ) : (
          <TableRow>
            <TableCell
              colSpan={headers.length}
              className="text-center py-10 text-slate-400"
            >
              No records found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Card>
);

export default CustomerManagementSystem;
