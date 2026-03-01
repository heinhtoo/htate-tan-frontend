/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currencyHelper";
import { useAuthStore } from "@/store/authStore";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { useMutation } from "@tanstack/react-query";
import { Edit, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { removeStock } from "./product.action";
import type { ProductResponse } from "./product.response";
import RestockForm from "./restock-form";

const ProductDetails = ({
  product,
  refetch,
}: {
  product: ProductResponse;
  refetch: () => void;
}) => {
  // 2. Logic: Determine Stock Status
  const isLowStock = product.totalCurrentStock <= product.lowStockAlertAt;
  const stockColor = isLowStock
    ? "bg-red-100 text-red-800"
    : "bg-green-100 text-green-800";
  const stockLabel = isLowStock ? "Low Stock" : "In Stock";
  const navigate = useNavigate();
  const { openPanel } = usePanelStore();
  const { user } = useAuthStore();
  const handleRestock = (product: ProductResponse) => {
    openPanel({
      title: `Restock: ${product.name}`,
      content: (
        <RestockForm
          productId={product.id}
          productName={product.name}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const { setError } = useErrorStore();

  const deleteMutation = useMutation({
    mutationFn: (stockId: number) =>
      removeStock({
        id: product.id,
        stockId,
      }),
    onSuccess: (payload) => {
      if (payload.error) {
        setError(payload.error as any);
      } else {
        refetch();
      }
    },
  });

  return (
    <div className="max-w-6xl w-full mx-auto p-6 bg-gray-50 min-h-screen">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-mono">
              SKU: {product.sku}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${stockColor}`}
            >
              {stockLabel} ({product.totalCurrentStock} units)
            </span>
          </div>
        </div>
        <div className="space-x-3 flex flex-row flex-wrap gap-3">
          {/* Action Buttons */}
          <button
            className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            onClick={() => {
              navigate("/products/" + product.sku + "?mode=edit");
            }}
          >
            Edit Product
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
            onClick={() => {
              handleRestock(product);
            }}
          >
            Restock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT COLUMN: DETAILS & IMAGE --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Product Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Selling Price</label>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="text-lg font-medium">
                  {product.category?.name || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Brand</label>
                <p className="text-lg font-medium">
                  {product.brand?.name || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Product Type</label>
                <p className="text-lg font-medium">
                  {product.productType?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm text-gray-500">Description</label>
              <p className="text-gray-700 mt-1 whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Card: Inventory Breakdown Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Inventory by Warehouse</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">Warehouse</th>
                    <th className="p-3 font-medium text-gray-700 text-right">
                      Current Qty
                    </th>
                    <th className="p-3 font-medium text-gray-700 text-right">
                      Purchased Price
                    </th>
                    <th className="p-3 font-medium text-gray-700 text-center">
                      Last Restock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.stocks && product.stocks.length > 0 ? (
                    product.stocks.map((stock) => (
                      <tr key={stock.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-900 font-medium">
                          {stock.warehouse.name}
                        </td>
                        <td className="p-3 text-gray-900 text-right font-bold">
                          {stock.currentQuantity}
                        </td>
                        <td className="p-3 text-gray-600 text-right">
                          {formatCurrency(stock.purchasedPriceInMMK)}
                        </td>
                        <td className="p-3 text-gray-500 text-center">
                          {/* Assuming stock entity has created_at or updated_at */}
                          {product.lastRestockedAt
                            ? new Date(
                                product.lastRestockedAt,
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPanel({
                                title: `Update Restock: ${product.name}`,
                                content: (
                                  <RestockForm
                                    productId={product.id}
                                    productName={product.name}
                                    onSubmitComplete={() => refetch()}
                                    stockData={{
                                      id: stock.id,
                                      purchasedPriceInMMK:
                                        stock.purchasedPriceInMMK,
                                      purchasedQuantity:
                                        stock.purchasedQuantity,
                                      warehouseId: stock.warehouse.id,
                                    }}
                                  />
                                ),
                              });
                            }}
                          >
                            <Edit />
                          </Button>
                          {user?.isAdmin && (
                            <AlertDialog>
                              {/* This button triggers the dialog */}
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-md"
                                  type="button"
                                  onClick={(e) => e.stopPropagation()} // prevent row click
                                >
                                  <TrashIcon />
                                </Button>
                              </AlertDialogTrigger>

                              {/* Dialog content */}
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirm Delete
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this order?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate(stock.id);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No stock records found. Please restock this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR STATS --- */}
        <div className="space-y-6">
          {/* Image Card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {product.imagePath ? (
              <img
                src={product.imagePath}
                alt={product.name}
                className="w-full h-48 object-contain rounded"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                No Image Available
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Stock Settings</h3>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Low Stock Alert At</span>
              <span className="font-mono font-bold text-orange-600">
                {product.lowStockAlertAt} units
              </span>
            </div>

            <div className="flex justify-between items-center py-2 pt-4">
              <span className="text-gray-600">Total Valuation</span>
              <span className="font-bold text-green-700">
                {/* Simple Calculation of Total Asset Value on Frontend */}
                {formatCurrency(
                  product.stocks?.reduce(
                    (acc, stock) =>
                      acc + stock.currentQuantity * stock.purchasedPriceInMMK,
                    0,
                  ) || 0,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
