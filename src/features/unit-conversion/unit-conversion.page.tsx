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
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import {
  getUnitConversions,
  removeUnitConversion,
} from "./unit-conversion.action";
import UnitConversionForm from "./unit-conversion.from";
import type { UnitConversionResponse } from "./unit-conversion.response";

// Mock Data structure based on the UnitConversion entity

export default function UnitConversionPage() {
  const { openPanel } = usePanelStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["other-charge-all"],
    queryFn: async () => {
      const data = await getUnitConversions({
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
  const handleEdit = (unitConversion: UnitConversionResponse) => {
    openPanel({
      title: `Edit UnitConversion: ${unitConversion.name}`,
      content: (
        <UnitConversionForm
          initialData={unitConversion}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New UnitConversion",
      content: (
        <UnitConversionForm
          initialData={null}
          onSubmitComplete={() => refetch()}
        />
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
          Unit Conversion ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Unit Conversion
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Product Types</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((unitConversion) => (
                <TableRow
                  key={unitConversion.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(unitConversion)}
                >
                  <TableCell className="font-medium">
                    {unitConversion.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {unitConversion.conversionRate}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {unitConversion.category?.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {unitConversion.category?.productType?.name}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(unitConversion);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeUnitConversion({
                          id: unitConversion.id,
                          version: unitConversion.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success(
                            "Unit conversion deleted successfully."
                          );
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
