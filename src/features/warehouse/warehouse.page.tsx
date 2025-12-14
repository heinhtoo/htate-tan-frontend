import DeleteButton from "@/components/shared/delete-button";
import { Badge } from "@/components/ui/badge";
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
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getWarehouses, removeWarehouse } from "./warehouse.action";
import WarehouseForm from "./warehouse.from";
import type { WarehouseResponse } from "./warehouse.response";

// Mock Data structure based on the Warehouse entity

export default function WarehousePage() {
  const { openPanel } = usePanelStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["other-charge-all"],
    queryFn: async () => {
      const data = await getWarehouses({
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
  const handleEdit = (warehouse: WarehouseResponse) => {
    openPanel({
      title: `Edit Warehouse: ${warehouse.name}`,
      content: (
        <WarehouseForm
          initialData={warehouse}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Warehouse",
      content: (
        <WarehouseForm initialData={null} onSubmitComplete={() => refetch()} />
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
          Warehouse ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Warehouse
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center w-[120px]">
                  Sellable
                </TableHead>
                <TableHead className="w-[160px]">Order Prefix</TableHead>
                <TableHead className="text-center w-[120px]">Staffs</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.data?.length ? (
                data.data.map((warehouse: WarehouseResponse) => (
                  <TableRow
                    key={warehouse.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEdit(warehouse)}
                  >
                    {/* Name */}
                    <TableCell className="font-medium">
                      {warehouse.name}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {warehouse.location || "No location provided"}
                    </TableCell>

                    {/* Is Sellable */}
                    <TableCell className="text-center">
                      <Badge
                        variant={warehouse.isSellable ? "default" : "secondary"}
                      >
                        {warehouse.isSellable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>

                    {/* Order Leading Text */}
                    <TableCell>{warehouse.orderLeadingText || "-"}</TableCell>

                    {/* No Of Staffs */}
                    <TableCell className="text-center">
                      {warehouse.noOfStaffs ?? "-"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(warehouse);
                        }}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>

                      <DeleteButton
                        deleteAction={async () => {
                          const response = await removeWarehouse({
                            id: warehouse.id,
                            version: warehouse.version,
                          });

                          if (response.response?.isSuccess) {
                            toast.success("Warehouse deleted successfully.");
                            refetch();
                          } else {
                            setError(response.error as ErrorResponse);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* Empty State */
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No warehouses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
