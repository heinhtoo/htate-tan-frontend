import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  DollarSign,
  MapPin,
  Phone,
  Plus,
  Receipt,
} from "lucide-react";

const CustomerDebtDetails = () => {
  // Mock data with focus on Debt
  const customer = {
    name: "Sarah Johnson",
    phone: "+1 (555) 012-3456",
    address: "123 Maple St, Springfield",
    totalDebt: 245.5, // This is the key metric now
    lastPaymentDate: "Oct 12, 2023",
    status: "Has Balance",
  };

  const transactions = [
    {
      id: "INV-102",
      date: "2024-03-20",
      type: "Sale",
      amount: "+$45.00",
      balance: "$245.50",
      status: "Unpaid",
    },
    {
      id: "PAY-055",
      date: "2024-03-15",
      type: "Payment",
      amount: "-$50.00",
      balance: "$200.50",
      status: "Processed",
    },
    {
      id: "INV-101",
      date: "2024-03-10",
      type: "Sale",
      amount: "+$120.20",
      balance: "$250.50",
      status: "Unpaid",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground">
            Track balances and credit history.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1">
            Edit Info
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Debt
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="md:col-span-1 shadow-sm border-t-4 border-t-primary">
          <CardHeader className="flex flex-col items-center pb-2">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                SJ
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <Badge
              variant={customer.totalDebt > 0 ? "destructive" : "secondary"}
              className="mt-2 uppercase"
            >
              {customer.totalDebt > 0 ? "Outstanding Debt" : "Clear Account"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm">
            <div className="flex items-center">
              <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
              {customer.phone}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
              {customer.address}
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase font-bold">
                Last Payment
              </p>
              <p className="font-medium">{customer.lastPaymentDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Debt & History */}
        <div className="md:col-span-2 space-y-6">
          {/* Debt Summary Card */}
          <Card
            className={
              customer.totalDebt > 0
                ? "bg-red-50 border-red-200"
                : "bg-green-50"
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${customer.totalDebt > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                  >
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Balance Owed
                    </p>
                    <h2
                      className={`text-4xl font-black ${customer.totalDebt > 0 ? "text-red-700" : "text-green-700"}`}
                    >
                      ${customer.totalDebt.toFixed(2)}
                    </h2>
                  </div>
                </div>
                {customer.totalDebt > 0 && (
                  <Button
                    variant="ghost"
                    className="text-red-700 hover:bg-red-100 underline"
                  >
                    Print Statement
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Account Ledger</CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {tx.date}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${tx.type === "Payment" ? "text-green-600" : "text-slate-700"}`}
                        >
                          {tx.type}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.id}
                        </p>
                      </TableCell>
                      <TableCell
                        className={
                          tx.type === "Payment"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {tx.balance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDebtDetails;
