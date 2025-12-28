import DeleteButton from "@/components/shared/delete-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, Image, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getPaymentTypes, removePaymentType } from "./payment-type.action";
import PaymentTypeForm from "./payment-type.from";
import type { PaymentTypeResponse } from "./payment-type.response";

// Mock Data structure based on the PaymentType entity

export default function PaymentTypePage() {
  const { openPanel } = usePanelStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const { data, error, refetch } = useQuery({
    queryKey: ["payment-type-all", debouncedQuery],
    queryFn: async () => {
      const data = await getPaymentTypes({
        page: "0",
        size: "0",
        s: "10",
        q: debouncedQuery,
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });

  const { setError } = useErrorStore();

  const handleEdit = (productType: PaymentTypeResponse) => {
    openPanel({
      title: `Edit PaymentType: ${productType.name}`,
      content: (
        <PaymentTypeForm
          initialData={productType}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New PaymentType",
      content: (
        <PaymentTypeForm
          initialData={null}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Payment Type ({data?.pagination?.totalItems})
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
            <PlusCircle className="h-4 w-4" /> Add New Payment Type
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center w-[120px]">
                  Commission
                </TableHead>
                <TableHead className="text-center w-[100px]">QR</TableHead>
                <TableHead className="text-center w-[120px]">Value</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.data?.length ? (
                data.data.map((paymentType) => (
                  <TableRow
                    key={paymentType.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEdit(paymentType)}
                  >
                    {/* Image */}
                    <TableCell>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={paymentType.imagePath}
                          alt={paymentType.name}
                        />
                        <AvatarFallback>
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-medium">
                      {paymentType.name}
                    </TableCell>

                    {/* Display Name */}
                    <TableCell>{paymentType.displayName}</TableCell>

                    {/* Description */}
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {paymentType.description || "No description"}
                    </TableCell>

                    {/* Commission */}
                    <TableCell className="text-center">
                      {paymentType.commission}%
                    </TableCell>

                    {/* Show QR */}
                    <TableCell className="text-center">
                      <Badge
                        variant={paymentType.showQR ? "default" : "secondary"}
                      >
                        {paymentType.showQR ? "Yes" : "No"}
                      </Badge>
                    </TableCell>

                    {/* Show Value */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          paymentType.showValue ? "default" : "secondary"
                        }
                      >
                        {paymentType.showValue ? "Yes" : "No"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(paymentType);
                        }}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>

                      <DeleteButton
                        deleteAction={async () => {
                          const response = await removePaymentType({
                            id: paymentType.id,
                            version: paymentType.version,
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
                ))
              ) : (
                /* Empty State */
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No payment types found.
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
