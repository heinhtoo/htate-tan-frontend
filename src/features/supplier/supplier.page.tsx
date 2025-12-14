import DeleteButton from "@/components/shared/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ErrorResponse } from "@/lib/actionHelper";
import { formatCurrency } from "@/lib/currencyHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getSuppliers, removeSupplier } from "./supplier.action";
import SupplierForm from "./supplier.from";
import type { SupplierResponse } from "./supplier.response";

// Mock Data structure based on the Supplier entity

export default function SupplierPage() {
  const { openPanel } = usePanelStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["supplier-all"],
    queryFn: async () => {
      const data = await getSuppliers({
        page: "0",
        size: "0",
        s: "",
        q: "",
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });
  const handleEdit = (supplier: SupplierResponse) => {
    openPanel({
      title: `Edit Supplier: ${supplier.name}`,
      content: (
        <SupplierForm
          initialData={supplier}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Supplier",
      content: (
        <SupplierForm initialData={null} onSubmitComplete={() => refetch()} />
      ),
    });
  };
  const { setError } = useErrorStore();

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Supplier ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Total Debt</TableHead>
                <TableHead>Pending Orders</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(supplier)}
                >
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {supplier.contact || "No contact provided."}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {supplier.address || "No address provided."}
                  </TableCell>
                  <TableCell>{formatCurrency(supplier.totalDebt)}</TableCell>
                  <TableCell>{supplier.totalPendingOrders}</TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(supplier);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeSupplier({
                          id: supplier.id,
                          version: supplier.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success("Payment Type deleted successfully.");
                          refetch();
                        } else {
                          setError(response.error as ErrorResponse);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
