import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { usePosStore } from "./pos.store";

export default function OrderTabs({ isCustomer }: { isCustomer: boolean }) {
  const {
    orders,
    activeSalesOrderId,
    activePurchaseOrderId,
    createOrder,
    switchOrder,
    deleteOrder,
  } = usePosStore();
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const activeOrderId = isCustomer ? activeSalesOrderId : activePurchaseOrderId;

  const handleDeleteClick = (orderId: string, hasItems: boolean) => {
    if (hasItems) {
      setOrderToDelete(orderId);
    } else {
      deleteOrder(orderId, isCustomer);
    }
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete, isCustomer);
      setOrderToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 border-b border-slate-100  w-full">
        {/* Order Tabs */}
        <SidebarTrigger className="-ml-1 text-gray-400" />
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {orders
            .filter((order) => order.isCustomer === isCustomer)
            .map((order) => {
              const isActive = order.id === activeOrderId;
              const itemCount = order.cart.reduce(
                (sum, item) => sum + item.qty,
                0,
              );

              return (
                <button
                  key={order.id}
                  onClick={() => switchOrder(order.id, isCustomer)}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 shrink-0",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
                  )}
                >
                  <span className="text-sm font-bold whitespace-nowrap">
                    {order.name}
                  </span>

                  {itemCount > 0 && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "h-5 min-w-5 px-1.5 text-[10px] font-black",
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-primary/10 text-primary border-primary/20",
                      )}
                    >
                      {itemCount}
                    </Badge>
                  )}

                  {/* Delete button - only show if more than one order */}
                  {orders.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(order.id, itemCount > 0);
                      }}
                      className={cn(
                        "ml-1 p-0.5 rounded-md transition-colors",
                        isActive
                          ? "text-white/60 hover:text-white hover:bg-white/20"
                          : "text-slate-400 hover:text-rose-500 hover:bg-rose-50",
                      )}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </button>
              );
            })}
        </div>

        {/* New Order Button */}
        <Button
          onClick={() => createOrder(isCustomer)}
          size="sm"
          className="shrink-0 h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This order contains items. Are you sure you want to delete it?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
