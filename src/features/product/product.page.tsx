import DeleteButton from "@/components/shared/delete-button";
import { PagePagination } from "@/components/shared/page-pagination";
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
import type { ErrorResponse } from "@/lib/actionHelper";
import { formatCurrency } from "@/lib/currencyHelper";
import { useErrorStore } from "@/store/error.store";
import { useQuery } from "@tanstack/react-query";
import { Edit, Image, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getProducts, removeProduct } from "./product.action";
import type { ProductResponse } from "./product.response";

// Mock Data structure based on the Product entity

export default function ProductPage() {
  const [page, setPage] = useState(0);

  const { data, error, refetch } = useQuery({
    queryKey: ["product-type-all", page],
    queryFn: async () => {
      const data = await getProducts({
        page: page ? page + "" : "0",
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

  const navigate = useNavigate();

  const { setError } = useErrorStore();

  const handleEdit = (product: ProductResponse) => {
    navigate("/products/" + product.sku);
  };

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Product ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button
            onClick={() => {
              navigate("/products/create");
            }}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Add New Product
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead className="w-[150px]">Product Info</TableHead>
                <TableHead>Category & Brand</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((product) => {
                // Logic for Stock Status
                const isLowStock =
                  product.totalCurrentStock <= product.lowStockAlertAt;
                const isOutOfStock = product.totalCurrentStock === 0;

                return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleEdit(product)}
                  >
                    {/* 1. Image Column */}
                    <TableCell>
                      <Avatar className="h-10 w-10 border rounded-md">
                        <AvatarImage
                          src={product.imagePath}
                          alt={product.name}
                        />
                        <AvatarFallback className="rounded-md">
                          <Image className="h-4 w-4 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* 2. Product Info (Name + SKU) */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {product.sku}
                        </span>
                      </div>
                    </TableCell>

                    {/* 3. Category & Brand */}
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-700">
                          {product.category?.name || "Uncategorized"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.brand?.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* 4. Price (Right Aligned) */}
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </TableCell>

                    {/* 5. Stock Status (Center Aligned with Badge) */}
                    <TableCell className="text-center">
                      <div className="flex flex-row items-center gap-3 justify-center">
                        <span className="font-bold text-sm">
                          {product.totalCurrentStock}
                        </span>
                        {isOutOfStock ? (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge className="h-5 px-1.5 text-[10px] bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px] text-green-700 border-green-200 bg-green-50"
                          >
                            In Stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Actions */}
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>

                      <DeleteButton
                        deleteAction={async () => {
                          const response = await removeProduct({
                            id: product.id,
                            version: product.version,
                          });

                          if (response.response?.isSuccess) {
                            toast.success("Product deleted successfully.");
                            refetch();
                          } else {
                            setError(response.error as ErrorResponse);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        <PagePagination
          pagination={data?.pagination}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </CardContent>
    </Card>
  );
}
