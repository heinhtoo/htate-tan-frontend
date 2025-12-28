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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Added AlertCircle and DollarSign icons
import {
  AlertCircle,
  DollarSign,
  History,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";

const CustomerDetailsPage = () => {
  const customer = {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 012-3456",
    address: "123 Maple St, Springfield",
    joinDate: "Oct 2023",
    totalSpent: "$1,240.50",
    currentDebt: 245.5, // Added debt field
    status: "Has Debt",
  };

  const transactions = [
    {
      id: "INV-102",
      date: "2024-03-20",
      amount: "$45.00",
      type: "Sale", // Distinguish between sales and payments
      status: "Unpaid",
    },
    {
      id: "PAY-055",
      date: "2024-03-15",
      amount: "$50.00",
      type: "Payment",
      status: "Processed",
    },
  ];

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center flex-col lg:flex-row gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Profile
          </h1>
          <p className="text-muted-foreground">
            Manage debt and purchase history.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          {/* Green button for recording money coming in */}
          <Button className="bg-green-600 hover:bg-green-700">
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="md:col-span-1 shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="flex flex-col items-center pb-2">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary/10">
              <AvatarImage src="" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{customer.name}</CardTitle>
            {/* Debt status badge */}
            <Badge
              className={
                customer.currentDebt > 0
                  ? "bg-red-100 text-red-700 mt-1"
                  : "bg-green-100 text-green-700 mt-1"
              }
            >
              {customer.currentDebt > 0
                ? "Outstanding Balance"
                : "Account Clear"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center text-sm">
              <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
              {customer.email}
            </div>
            <div className="flex items-center text-sm">
              <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
              {customer.phone}
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
              {customer.address}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Stats & History */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Stats - DEBT FOCUS */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardDescription className="text-red-800 font-medium">
                  Total Unpaid Debt
                </CardDescription>
                <CardTitle className="text-3xl text-red-600 flex items-center">
                  <AlertCircle className="mr-2 h-6 w-6" />$
                  {customer.currentDebt.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Lifetime Spending</CardDescription>
                <CardTitle className="text-3xl text-slate-700">
                  {customer.totalSpent}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Transaction History Table */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Account Ledger</CardTitle>
                <CardDescription>
                  History of sales and payments.
                </CardDescription>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <span
                          className={`font-medium ${tx.type === "Payment" ? "text-green-600" : "text-slate-900"}`}
                        >
                          {tx.type}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.id}
                        </p>
                      </TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "Unpaid" ? "destructive" : "outline"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${tx.type === "Payment" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "Payment" ? "-" : "+"}
                        {tx.amount}
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

export default CustomerDetailsPage;
