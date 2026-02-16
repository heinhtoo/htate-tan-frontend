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
import { useDebounce } from "@/hooks/use-debounce";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Currency, Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import ModifyProductGroupForm from "./modify-price-product-group.from";
import { getProductGroups, removeProductGroup } from "./product-group.action";
import ProductGroupForm from "./product-group.from";
import type { ProductGroupResponse } from "./product-group.response";

// Mock Data structure based on the ProductGroup entity

export default function ProductGroupPage() {
  const { openPanel } = usePanelStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const { data, error, refetch } = useQuery({
    queryKey: ["product-group-all", debouncedQuery],
    queryFn: async () => {
      const data = await getProductGroups({
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
  const handleEdit = (productGroup: ProductGroupResponse) => {
    openPanel({
      title: `Edit Product Group: ${productGroup.name}`,
      content: (
        <ProductGroupForm
          initialData={productGroup}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Product Group",
      content: (
        <ProductGroupForm
          initialData={null}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handlePriceChange = (productGroup: ProductGroupResponse) => {
    openPanel({
      title: "Modify Price: " + productGroup.name,
      content: (
        <ModifyProductGroupForm
          initialData={productGroup}
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
          Product Group ({data?.pagination?.totalItems})
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
            <PlusCircle className="h-4 w-4" /> Add New Product Group
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
              {data?.data.map((productGroup) => (
                <TableRow
                  key={productGroup.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(productGroup)}
                >
                  <TableCell className="font-medium">
                    {productGroup.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {productGroup.description || "No description provided."}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {productGroup.brand.map((item) => (
                      <Badge title={item.name} key={item.id}>
                        {item.name}
                      </Badge>
                    ))}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(productGroup);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePriceChange(productGroup);
                      }}
                    >
                      <Currency className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeProductGroup({
                          id: productGroup.id,
                          version: productGroup.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success("Product group deleted successfully.");
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
