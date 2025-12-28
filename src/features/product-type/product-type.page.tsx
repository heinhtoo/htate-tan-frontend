import DeleteButton from "@/components/shared/delete-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getProductTypes, removeProductType } from "./product-type.action";
import ProductTypeForm from "./product-type.from";
import type { ProductTypeResponse } from "./product-type.response";

// Mock Data structure based on the ProductType entity

export default function ProductTypePage() {
  const { openPanel } = usePanelStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const { data, error, refetch } = useQuery({
    queryKey: ["product-type-all", debouncedQuery],
    queryFn: async () => {
      const data = await getProductTypes({
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
  const handleEdit = (productType: ProductTypeResponse) => {
    openPanel({
      title: `Edit ProductType: ${productType.name}`,
      content: (
        <ProductTypeForm
          initialData={productType}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New ProductType",
      content: (
        <ProductTypeForm
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
          Product Type ({data?.pagination?.totalItems})
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
            <PlusCircle className="h-4 w-4" /> Add New Product Type
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
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((productType) => (
                <TableRow
                  key={productType.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(productType)}
                >
                  <TableCell>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={productType.imagePath}
                        alt={productType.name}
                      />
                      <AvatarFallback>
                        <Image className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {productType.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {productType.description || "No description provided."}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(productType);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeProductType({
                          id: productType.id,
                          version: productType.version,
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
