import DeleteButton from "@/components/shared/delete-button";
import { PagePagination } from "@/components/shared/page-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatCurrency } from "@/lib/currencyHelper";
import { useErrorStore } from "@/store/error.store";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Edit,
  Image,
  PlusCircle,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import NumpadDialog from "../pos/numpad-dialog.component";
import { getProducts, removeProduct, updateProduct } from "./product.action";
import type { ProductResponse } from "./product.response";

enum ProductOrderByTypes {
  name_asc = "sku_asc",
  name_desc = "sku_desc",
  price_asc = "price_asc",
  price_desc = "price_desc",
  stock_asc = "stock_asc",
  stock_desc = "stock_desc",
}

export default function ProductPage() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  // Bulk selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set(),
  );
  // const [bulkPriceDialogOpen, setBulkPriceDialogOpen] = useState(false); // Unused
  const [bulkPriceValue, setBulkPriceValue] = useState(0); // Keeping for potential other uses or remove if fully replaced by argument
  const [numpadConfig, setNumpadConfig] = useState<{
    open: boolean;
    title: string;
    currentValue: number;
    onConfirm: (value: number) => void;
    suffix?: string;
  }>({
    open: false,
    title: "",
    currentValue: 0,
    onConfirm: () => {},
    suffix: "",
  });

  const { data, error, refetch } = useQuery({
    queryKey: ["product-type-all", page, orderBy, debouncedQuery],
    queryFn: async () => {
      const data = await getProducts({
        page: page ? page + "" : "0",
        size: "300",
        s: orderBy,
        q: debouncedQuery,
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

  const toggleSort = (type: "sku" | "price" | "stock") => {
    setOrderBy((prev) => {
      if (prev === `${type}_asc`) return `${type}_desc`;
      return `${type}_asc`;
    });
  };

  // Selection handlers
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === data?.data.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(data?.data.map((p) => p.id) || []));
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleBulkPriceUpdate = async (priceOverride?: number) => {
    if (selectedProducts.size === 0) return;

    const priceToUpdate =
      priceOverride !== undefined ? priceOverride : bulkPriceValue;
    const toastId = toast.loading(
      `Updating prices for ${selectedProducts.size} products...`,
    );

    try {
      const updatePromises = Array.from(selectedProducts).map(async (id) => {
        const product = data?.data.find((p) => p.id === id);
        if (!product) return;

        // Construct payload required by schema
        const payload = {
          name: product.name,
          price: priceToUpdate,
          description: product.description,
          imagePath: product.imagePath,
          lowStockAlertAt: product.lowStockAlertAt,
          categoryId: product.category?.id || 0,
          brandId: product.brand?.id || 0,
          productTypeId: product.productType?.id || 0,
          groupId: product.group?.id,
        };

        return updateProduct({
          sku: product.sku,
          data: payload,
          version: product.version,
        });
      });

      await Promise.all(updatePromises);

      toast.success("Bulk price update completed", { id: toastId });
      // setBulkPriceDialogOpen(false); // Removed
      setSelectedProducts(new Set());
      refetch();
    } catch (error) {
      console.error("Bulk update failed", error);
      toast.error("Failed to update some products", { id: toastId });
    }
  };

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Product ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
            }}
          />
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
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      (data?.data?.length ?? 0) > 0 &&
                      selectedProducts.size === (data?.data?.length ?? 0)
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-100/50 transition-colors"
                  onClick={() => toggleSort("sku")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        orderBy.includes("sku") ? "text-blue-600 font-bold" : ""
                      }
                    >
                      Product Info
                    </span>

                    {/* Dynamic Icon showing the current state */}
                    <div className="flex items-center text-muted-foreground/50">
                      {orderBy === "sku_asc" && (
                        <SortAsc className="h-4 w-4 text-blue-600" />
                      )}
                      {orderBy === "sku_desc" && (
                        <SortDesc className="h-4 w-4 text-blue-600" />
                      )}
                      {!orderBy.includes("sku") && (
                        <SortAsc className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead>Category & Brand</TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-100/50 transition-colors"
                  onClick={() => toggleSort("price")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        orderBy.includes("price")
                          ? "text-blue-600 font-bold"
                          : ""
                      }
                    >
                      Price
                    </span>

                    {/* Dynamic Icon showing the current state */}
                    <div className="flex items-center text-muted-foreground/50">
                      {orderBy === ProductOrderByTypes.price_asc && (
                        <SortAsc className="h-4 w-4 text-blue-600" />
                      )}
                      {orderBy === ProductOrderByTypes.price_desc && (
                        <SortDesc className="h-4 w-4 text-blue-600" />
                      )}
                      {!orderBy.includes("price") && (
                        <SortAsc className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-100/50 transition-colors"
                  onClick={() => toggleSort("stock")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        orderBy.includes("stock")
                          ? "text-blue-600 font-bold"
                          : ""
                      }
                    >
                      Stock
                    </span>

                    {/* Dynamic Icon showing the current state */}
                    <div className="flex items-center text-muted-foreground/50">
                      {orderBy === ProductOrderByTypes.stock_asc && (
                        <SortAsc className="h-4 w-4 text-blue-600" />
                      )}
                      {orderBy === ProductOrderByTypes.stock_desc && (
                        <SortDesc className="h-4 w-4 text-blue-600" />
                      )}
                      {!orderBy.includes("stock") && (
                        <SortAsc className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                </TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() =>
                          toggleProductSelection(product.id)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>

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
                    <TableCell className="font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </TableCell>

                    {/* 5. Stock Status (Center Aligned with Badge) */}
                    <TableCell>
                      <div className="flex flex-row items-center gap-3">
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

      {/* Floating Bulk Action Toolbar */}
      {selectedProducts.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in z-50">
          <span className="text-sm font-bold pl-2">
            {selectedProducts.size} selected
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBulkPriceValue(0);
              // setBulkPriceDialogOpen(true); // Removed
              setNumpadConfig({
                open: true,
                title: "Set Bulk Price",
                currentValue: 0,
                onConfirm: (value) => {
                  setBulkPriceValue(value);
                  setTimeout(() => handleBulkPriceUpdate(value), 0);
                },
                suffix: "Ks",
              });
            }}
            className="text-white hover:text-white hover:bg-slate-800 gap-2 h-8"
          >
            <DollarSign className="h-4 w-4" />
            Update Price
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Numpad Dialog for Bulk Price */}
      <NumpadDialog
        open={numpadConfig.open}
        onClose={() => setNumpadConfig((prev) => ({ ...prev, open: false }))}
        title={numpadConfig.title}
        currentValue={numpadConfig.currentValue}
        onConfirm={numpadConfig.onConfirm}
        suffix={numpadConfig.suffix}
      />
    </Card>
  );
}
