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
import { useDebounce } from "@/hooks/use-debounce";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getCarGates, removeCarGate } from "./car-gate.action";
import CarGateForm from "./car-gate.from";
import type { CarGateResponse } from "./car-gate.response";

// Mock Data structure based on the CarGate entity

export default function CarGatePage() {
  const { openPanel } = usePanelStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const { data, error, refetch } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: async () => {
      const data = await getCarGates({
        page: "0",
        size: "0",
        s: "",
        q: debouncedQuery,
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });
  const handleEdit = (carGate: CarGateResponse) => {
    openPanel({
      title: `Edit CarGate: ${carGate.gateName}`,
      content: (
        <CarGateForm initialData={carGate} onSubmitComplete={() => refetch()} />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New CarGate",
      content: (
        <CarGateForm initialData={null} onSubmitComplete={() => refetch()} />
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
          Car Gate ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
            }}
          />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Car Gate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((carGate) => (
                <TableRow
                  key={carGate.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(carGate)}
                >
                  <TableCell className="font-medium">
                    {carGate.gateName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {carGate.location || "No location provided."}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(carGate);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeCarGate({
                          id: carGate.id,
                          version: carGate.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success("Other charge deleted successfully.");
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
