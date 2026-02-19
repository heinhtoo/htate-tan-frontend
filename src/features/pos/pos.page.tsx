/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  ChevronsUpDown,
  CreditCard,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
  XIcon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePanelStore } from "@/store/panelStore";
import { useNavigate } from "react-router";
import { getCarGates } from "../car-gate/car-gate.action";
import { getCustomers } from "../customer/customer.action";
import CustomerForm from "../customer/customer.from";
import { getOtherCharges } from "../other-charge/other-charge.action";
import { getPaymentTypes } from "../payment-type/payment-type.action";
import type { ProductResponse } from "../product/product.response";
import { getSetting } from "../setting/setting.action";
import { SettingKey } from "../setting/setting.response";
import NumpadDialog from "./numpad-dialog.component";
import OrderTabs from "./order-tabs.component";
import POSProductSection from "./pos-product-section";
import { createPOSOrder } from "./pos.action";
import { usePosStore } from "./pos.store";

// --- REUSABLE CART COMPONENT ---
const CartSection = ({
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  removeFromCart,
  grandTotal,
  handleCheckout,
  isLoading,
  refetch,
  isCustomer,
  setNumpadConfig,
  setCartItemQty,
  updateCartItemPrice,
  closeCart,
}: any) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  // Assuming user and formatAmount are provided via context or props
  const formatAmount = (num: number) => num.toLocaleString() + " Ks";
  const { openPanel } = usePanelStore();

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* --- CUSTOMER SECTION --- */}
      <div className="p-3 bg-white border-b border-slate-100 space-y-2 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-between h-10 rounded-xl bg-slate-50 border-none transition-all duration-200",
                  open
                    ? "ring-2 ring-primary/20 bg-white shadow-md"
                    : "hover:bg-slate-100",
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden text-left">
                  <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <User
                      className={cn(
                        "h-4 w-4",
                        selectedCustomer ? "text-primary" : "text-slate-300",
                      )}
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span
                      className={cn(
                        "text-xs font-bold truncate",
                        selectedCustomer ? "text-slate-900" : "text-slate-400",
                      )}
                    >
                      {selectedCustomer
                        ? selectedCustomer.name
                        : "Walk-in Customer"}

                      {selectedCustomer && selectedCustomer.city
                        ? `(${selectedCustomer.city})`
                        : ""}
                    </span>
                    {selectedCustomer && (
                      <span className="text-[9px] text-slate-400 font-medium tracking-tight">
                        {selectedCustomer.phoneNumber || "No contact info"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-30" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[360px] p-0 shadow-2xl rounded-2xl border-none overflow-y-auto max-h-[320px]"
              align="start"
            >
              <Command className="rounded-2xl">
                <CommandInput
                  placeholder="Search client name or phone..."
                  className="h-12 border-none ring-0 focus:ring-0"
                />
                <CommandList className="overflow-y-auto max-h-[320px]">
                  <CommandEmpty className="p-6 text-center text-sm text-slate-400 font-medium">
                    No results found.
                  </CommandEmpty>
                  <CommandGroup>
                    {customers.map((c: any) => (
                      <CommandItem
                        key={c.id}
                        onSelect={() => {
                          setSelectedCustomer(c);
                          setOpen(false);
                        }}
                        className="p-3 m-1 rounded-xl cursor-pointer aria-selected:bg-slate-50"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              selectedCustomer?.id === c.id
                                ? "bg-primary"
                                : "bg-transparent",
                            )}
                          />
                          <div className="flex flex-col flex-1">
                            <span className="font-bold text-sm text-slate-900">
                              {c.name} {c.city ? `(${c.city})` : ""}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {c.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex flex-row items-center gap-3">
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="h-6 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold px-2 rounded-full"
              >
                <X className="h-3 w-3 mr-1" /> RESET
              </Button>
            )}
            {!selectedCustomer && (
              <Button
                onClick={() => {
                  closeCart();
                  setOpen(false);
                  openPanel({
                    title: "Create New Customer",
                    content: (
                      <CustomerForm
                        initialData={null}
                        onSubmitComplete={() => refetch()}
                        isCustomer={isCustomer}
                      />
                    ),
                  });
                }}
                size={"icon"}
              >
                <Plus />
              </Button>
            )}
          </div>
        </div>

        {selectedCustomer && user?.isAdmin && (
          <div
            className={cn(
              "p-2 rounded-xl flex items-center justify-between border-none transition-all animate-in fade-in slide-in-from-top-2",
              selectedCustomer.totalDebt > 0
                ? "bg-rose-50/50"
                : "bg-emerald-50/50",
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "p-1.5 rounded-lg shadow-sm",
                  selectedCustomer.totalDebt > 0
                    ? "bg-white text-rose-500"
                    : "bg-white text-emerald-500",
                )}
              >
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Account Balance
                </p>
                <p
                  className={cn(
                    "font-black text-base leading-none",
                    selectedCustomer.totalDebt > 0
                      ? "text-rose-600"
                      : "text-emerald-600",
                  )}
                >
                  {formatAmount(selectedCustomer.totalDebt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CART ITEMS LIST (Odoo-style) --- */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
            <ShoppingCart className="h-12 w-12 text-slate-200" />
            <p className="text-xs font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cart.map((item: any) => (
              <div
                key={`${item.id}-${item.selectedUnitName}`}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 p-2 items-center">
                  {/* Product Info - 5 cols */}
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <img
                      src={item.imagePath}
                      className="h-8 w-8 object-contain shrink-0"
                      alt=""
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">[{item.sku}]</p>
                    </div>
                  </div>

                  {/* Quantity - 3 cols */}
                  <div className="col-span-2">
                    <button
                      onClick={() => {
                        setNumpadConfig({
                          open: true,
                          title: "Quantity",
                          currentValue: item.qty,
                          onConfirm: (value: number) =>
                            setCartItemQty(
                              item.id,
                              value,
                              item.selectedUnitName,
                            ),
                          suffix: "pcs",
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-50 hover:bg-primary/10 border border-slate-200 hover:border-primary/30 rounded text-xs font-bold text-slate-700 hover:text-primary transition-all text-center"
                    >
                      {item.qty}
                    </button>
                  </div>

                  {/* Price - 2 cols */}
                  <div className="col-span-2">
                    <button
                      onClick={() => {
                        setNumpadConfig({
                          open: true,
                          title: "Price",
                          currentValue: item.price,
                          onConfirm: (value: number) =>
                            updateCartItemPrice(
                              item.id,
                              value,
                              item.selectedUnitName,
                            ),
                          suffix: "Ks",
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded text-xs font-bold text-slate-700 hover:text-emerald-700 transition-all text-right"
                    >
                      {item.price.toLocaleString()}
                    </button>
                  </div>

                  {/* Subtotal - 2 cols */}
                  <div className="col-span-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 text-right flex-1">
                      {(
                        item.price *
                        item.qty *
                        (item.convertedQtyMultiplier || 1)
                      ).toLocaleString()}
                    </p>
                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.selectedUnitName)
                      }
                      className="ml-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="sm:hidden p-2 space-y-2">
                  {/* Product Info */}
                  <div className="flex items-center gap-2">
                    <img
                      src={item.imagePath}
                      className="h-10 w-10 object-contain shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.selectedUnitName}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.selectedUnitName)
                      }
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Qty, Price, Total */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setNumpadConfig({
                          open: true,
                          title: "Quantity",
                          currentValue: item.qty,
                          onConfirm: (value: number) =>
                            setCartItemQty(
                              item.id,
                              value,
                              item.selectedUnitName,
                            ),
                          suffix: "pcs",
                        });
                      }}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-primary/10 border border-slate-200 hover:border-primary/30 rounded transition-all"
                    >
                      <p className="text-[10px] text-slate-400 mb-0.5">Qty</p>
                      <p className="text-xs font-bold text-slate-700">
                        {item.qty}
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setNumpadConfig({
                          open: true,
                          title: "Price",
                          currentValue: item.price,
                          onConfirm: (value: number) =>
                            updateCartItemPrice(
                              item.id,
                              value,
                              item.selectedUnitName,
                            ),
                          suffix: "Ks",
                        });
                      }}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded transition-all"
                    >
                      <p className="text-[10px] text-slate-400 mb-0.5">Price</p>
                      <p className="text-xs font-bold text-slate-700">
                        {item.price.toLocaleString()}
                      </p>
                    </button>

                    <div className="px-2 py-1.5 bg-slate-100 rounded">
                      <p className="text-[10px] text-slate-400 mb-0.5">Total</p>
                      <p className="text-xs font-bold text-slate-900">
                        {(
                          item.price *
                          item.qty *
                          (item.convertedQtyMultiplier || 1)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CHECKOUT FOOTER (Ultra-Compact) --- */}
      <div className="p-2 bg-white border-t border-slate-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            Total
          </span>
          <p className="text-2xl font-black text-slate-900">
            {grandTotal.toLocaleString()}
            <span className="text-xs font-medium text-slate-400 ml-1">Ks</span>
          </p>
        </div>

        <Button
          className={cn(
            "w-full h-11 rounded-lg text-sm font-bold shadow-sm transition-all",
            selectedCustomer?.totalDebt > 0
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-primary hover:bg-primary/90",
          )}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {selectedCustomer?.totalDebt > 0 ? "Post to Debt" : "Payment"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
export default function PosPage({ isCustomer }: { isCustomer: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, []);
  // Use Zustand store instead of local state
  const {
    getActiveOrder,
    addToCart: addToCartStore,
    updateCartQty: updateCartQtyStore,
    setCartItemQty: setCartItemQtyStore,
    updateCartItemPrice: updateCartItemPriceStore,
    removeFromCart: removeFromCartStore,
    setCustomer,
    setCarGate,
    addOtherCharge: addOtherChargeStore,
    updateOtherChargeAmount,
    removeOtherCharge: removeOtherChargeStore,
    addPaymentMethod: addPaymentMethodStore,
    updatePayment: updatePaymentStore,
    removePayment: removePaymentStore,
    setRemark,
    setGlobalDiscount,
    clearActiveOrder: clearActiveOrderStore,
  } = usePosStore();

  const activeOrder = getActiveOrder(isCustomer);

  const setCartItemQty = (productId: number, qty: number, unitName: string) => {
    setCartItemQtyStore(productId, qty, unitName, isCustomer);
  };

  const updateCartItemPrice = (
    productId: number,
    price: number,
    unitName: string,
  ) => {
    updateCartItemPriceStore(productId, price, unitName, isCustomer);
  };

  const updateCartQty = (
    productId: number,
    delta: number,
    unitName: string,
  ) => {
    updateCartQtyStore(productId, delta, unitName, isCustomer);
  };

  const removeFromCart = (productId: number, unitName: string) => {
    removeFromCartStore(productId, unitName, isCustomer);
  };

  const addToCart = (
    product: ProductResponse,
    multiplier: number,
    unitName: string,
  ) => {
    if (STOCK_SETTING === "false" && product.totalCurrentStock <= 0) {
      toast.error("There are no stock available", {
        position: "top-center",
      });
      return;
    }
    addToCartStore(product, multiplier, unitName, isCustomer);
    toast.success(`${product.name} added to cart`, {
      position: "top-center",
    });
  };

  const setSelectedCustomer = (customer: any) => {
    setCustomer(customer, isCustomer);
  };

  const setSelectedCarGate = (carGateId: number | undefined) => {
    setCarGate(carGateId, isCustomer);
  };

  const setSelectedRemark = (remark: string) => {
    setRemark(remark, isCustomer);
  };

  const setSelectedGlobalDiscount = (discount: number) => {
    setGlobalDiscount(discount, isCustomer);
  };
  const cart = activeOrder?.cart || [];
  const selectedCustomer = activeOrder?.selectedCustomer || null;
  const checkoutDetails = activeOrder?.checkoutDetails || {
    carGateId: undefined,
    otherCharges: [],
    payment: [],
    remark: "",
    globalDiscount: 0,
  };

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
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
  const { data: STOCK_SETTING } = useQuery({
    queryKey: [SettingKey.StockSetting],
    queryFn: async () => {
      const data = await getSetting({ settingKey: SettingKey.StockSetting });
      if (data.response) {
        return data.response.result.payload.value;
      } else {
        throw data.error;
      }
    },
  });

  const { data: LIMIT_SETTING } = useQuery({
    queryKey: [SettingKey.LimitSetting],
    queryFn: async () => {
      const data = await getSetting({ settingKey: SettingKey.LimitSetting });
      if (data.response) {
        return data.response.result.payload.value;
      } else {
        throw data.error;
      }
    },
  });

  const { data: OTHER_CHARGES } = useQuery({
    queryKey: ["other-charges-all"],
    queryFn: () =>
      getOtherCharges({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response,
      ),
  });
  const { data: CAR_GATES } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: () =>
      getCarGates({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response,
      ),
  });
  const { data: PAYMENT_METHODS } = useQuery({
    queryKey: ["payment-method-all"],
    queryFn: () =>
      getPaymentTypes({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response,
      ),
  });

  const { data: CUSTOMERS, refetch: refetchCustomers } = useQuery({
    queryKey: ["customer-all"],
    queryFn: () =>
      getCustomers({ page: "0", size: "0", s: "", q: "", isCustomer }).then(
        (r) => r.response,
      ),
  });

  const otherChargesTotal = checkoutDetails.otherCharges.reduce(
    (sum, oc) => sum + (oc.amount || 0),
    0,
  );

  const itemTotal = cart.reduce(
    (acc, i) => acc + i.price * i.qty * (i.convertedQtyMultiplier || 1),
    0,
  );
  const grandTotal =
    itemTotal + otherChargesTotal - (checkoutDetails.globalDiscount || 0);

  const [isLoading, startTransition] = useTransition();
  const [selectedOtherChargeId, setSelectedOtherChargeId] = useState("");
  const [selectedPaymentMethodId] = useState("");
  const navigate = useNavigate();

  function handleCheckout() {
    const isOverLimit =
      LIMIT_SETTING === "true" &&
      selectedCustomer &&
      selectedCustomer.totalDebt &&
      selectedCustomer.creditLimit &&
      selectedCustomer?.totalDebt > selectedCustomer?.creditLimit;

    if (isOverLimit && user?.isAdmin && isCustomer === true) {
      const proceed = window.confirm(
        "Total debt exceeds credit limit. Do you want to proceed anyway?",
      );
      if (!proceed) return; // Exit the function if they click 'Cancel'
    }

    setIsConfirmDialogOpen(true);
  }

  async function processFinalOrder() {
    startTransition(async () => {
      const { payment, ...checkout } = checkoutDetails;
      const finalizedPayments = [...payment];
      if (balance > 0) {
        // Find the index of the account that should absorb the change (showValue: true)
        const cashAccountIndex = finalizedPayments.findIndex(
          (p) => p.showValue === true,
        );

        if (cashAccountIndex !== -1) {
          const currentAmount = finalizedPayments[cashAccountIndex].amount || 0;

          // Subtract the change from this specific account
          // We use Math.max(0, ...) so it doesn't go negative if something went wrong
          finalizedPayments[cashAccountIndex] = {
            ...finalizedPayments[cashAccountIndex],
            amount: Math.max(0, currentAmount - balance),
          };
        } else {
          // FALLBACK: If no showValue account is found, deduct from the very last payment added
          const lastIdx = finalizedPayments.length - 1;
          finalizedPayments[lastIdx] = {
            ...finalizedPayments[lastIdx],
            amount: Math.max(
              0,
              (finalizedPayments[lastIdx].amount || 0) - balance,
            ),
          };
        }
      }

      // 3. Filter out payments that became 0 (optional but cleaner)
      const payloadPayments = finalizedPayments.filter((p) => p.amount > 0);
      const { error, response } = await createPOSOrder({
        cart,
        selectedCustomer,
        ...checkout,
        payment: payloadPayments,
        globalDiscount: checkoutDetails.globalDiscount || 0,
        isCustomer,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast(
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span>
            Sale completed with order no: {response?.result.payload.id}
          </span>
          <button
            onClick={() =>
              navigate(
                isCustomer
                  ? "/orders/" + response?.result.payload.id
                  : "/purchase-orders/" + response?.result.payload.id,
              )
            }
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Go to Order
          </button>
        </div>,
        { duration: 5000 }, // optional: toast auto-close
      );
      queryClient.invalidateQueries({
        queryKey: ["product-all"],
      });
      refetchCustomers();
      clearActiveOrderStore(isCustomer);
      setIsMobileCartOpen(false);
      setIsConfirmDialogOpen(false); // Close dialog
    });
  }

  const addOtherCharge = (chargeId: string) => {
    setSelectedOtherChargeId("");

    const charge = OTHER_CHARGES?.data.find(
      (c: any) => c.id.toString() === chargeId,
    );
    if (!charge) return;

    // Prevent duplicate selection
    if (
      checkoutDetails.otherCharges.some((oc) => oc.otherChargeId === charge.id)
    ) {
      toast.error("Charge already added");
      return;
    }

    addOtherChargeStore(
      {
        otherChargeId: charge.id,
        amount: 0,
        name: charge.name,
      },
      isCustomer,
    );
  };

  useEffect(() => {
    if (
      OTHER_CHARGES?.data &&
      OTHER_CHARGES.data.length > 0 &&
      checkoutDetails.otherCharges.length === 0 &&
      checkoutDetails.carGateId
    ) {
      addOtherCharge(OTHER_CHARGES.data[0].id + "");
    }
  }, [OTHER_CHARGES, checkoutDetails.otherCharges, checkoutDetails.carGateId]);

  const updateChargeAmount = (id: number, amount: number) => {
    updateOtherChargeAmount(id, amount, isCustomer);
  };

  const removeOtherCharge = (id: number) => {
    removeOtherChargeStore(id, isCustomer);
  };

  const addPaymentMethod = (methodId: string) => {
    const method = PAYMENT_METHODS?.data.find(
      (p: any) => p.id.toString() === methodId,
    );
    if (!method) return;

    if (checkoutDetails.payment.some((p) => p.paymentMethodId === method.id)) {
      toast.error("Payment method already added");
      return;
    }

    const remaining = grandTotal - totalPaid; // Calculate what's left

    if (method) {
      const newPayment = {
        paymentMethodId: method.id,
        name: method.name,
        amount: remaining > 0 ? remaining : 0, // Auto-fill the balance!
        referenceId: "",
        paymentQR: method.qrPath, // assuming it's in your data
        showValue: method.showValue,
      };
      addPaymentMethodStore(newPayment, isCustomer);
    }
  };

  const updatePayment = (
    id: number,
    data: Partial<{ amount: number; referenceId: string }>,
  ) => {
    updatePaymentStore(id, data, isCustomer);
  };

  const removePayment = (id: number) => {
    removePaymentStore(id, isCustomer);
  };

  const totalPaid = checkoutDetails.payment.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0,
  );
  const balance = totalPaid - grandTotal;

  const [viewingQR, setViewingQR] = useState<any>(undefined);
  return (
    <>
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
        <POSProductSection addToCart={addToCart} />

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-[400px] flex-col bg-white border-l shadow-2xl z-20">
          <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black tracking-tight">
                Current Order
              </h2>
            </div>
            <Badge variant="outline" className="rounded-lg font-bold border-2">
              {cart.length} Items
            </Badge>
          </div>
          <CartSection
            isCustomer={isCustomer}
            refetch={() => {
              refetchCustomers();
            }}
            closeCart={() => {
              setIsMobileCartOpen(false);
            }}
            isLoading={isLoading}
            cart={cart}
            customers={CUSTOMERS?.data || []}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            updateQty={updateCartQty}
            removeFromCart={removeFromCart}
            grandTotal={grandTotal}
            handleCheckout={handleCheckout}
            setNumpadConfig={setNumpadConfig}
            setCartItemQty={setCartItemQty}
            updateCartItemPrice={updateCartItemPrice}
          />
        </aside>

        {/* MOBILE TRIGGER */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-20">
          <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
            <SheetTrigger asChild>
              <Button className="w-full h-16 rounded-[2rem] shadow-2xl shadow-primary/30 flex justify-between px-8 text-lg font-black bg-primary">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> {cart.length}
                </span>
                <span>{grandTotal.toLocaleString()} Ks</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[92vh] p-0 rounded-t-[3rem] border-none shadow-2xl"
            >
              <div className="flex flex-row items-center justify-end">
                <Button
                  onClick={() => {
                    setIsMobileCartOpen(false);
                  }}
                >
                  <XIcon />
                </Button>
              </div>
              <OrderTabs isCustomer={isCustomer} />
              <CartSection
                refetch={() => {
                  refetchCustomers();
                }}
                cart={cart}
                isLoading={isLoading}
                customers={CUSTOMERS?.data || []}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                closeCart={() => {
                  setIsMobileCartOpen(false);
                }}
                updateQty={updateCartQty}
                removeFromCart={removeFromCart}
                grandTotal={grandTotal}
                handleCheckout={handleCheckout}
                isCustomer={isCustomer}
                setNumpadConfig={setNumpadConfig}
                setCartItemQty={setCartItemQty}
                updateCartItemPrice={updateCartItemPrice}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          {/* Header Section */}
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              Finalize Order
            </DialogTitle>

            {selectedCustomer?.totalDebt &&
              selectedCustomer?.creditLimit &&
              selectedCustomer.totalDebt > selectedCustomer.creditLimit && (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-start gap-3 text-rose-600 mt-4 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider">
                      Credit Warning
                    </p>
                    <p className="text-[11px] font-medium leading-relaxed opacity-90">
                      Customer debt exceeds their credit limit.
                    </p>
                  </div>
                </div>
              )}
          </DialogHeader>

          <div className="px-8 pb-8 max-h-[65vh] overflow-y-auto space-y-3 scrollbar-hide">
            {/* 1. Logistics & Remarks Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Truck className="h-3 w-3" /> Car Gate
              </Label>
              <Select
                onValueChange={(v) => setSelectedCarGate(parseInt(v))}
                value={checkoutDetails.carGateId?.toString()}
              >
                <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all w-full">
                  <SelectValue placeholder="Select Gate" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {CAR_GATES?.data.map((gate) => (
                    <SelectItem key={gate.id} value={gate.id.toString()}>
                      {gate.gateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Charges & Payments Section */}
            <div className="space-y-6">
              {/* Other Charges */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Additional Charges
                  </Label>
                  <Select
                    value={selectedOtherChargeId}
                    onValueChange={addOtherCharge}
                  >
                    <SelectTrigger className="h-8 w-fit gap-2 rounded-full bg-slate-100 border-none text-[10px] font-black px-4 hover:bg-slate-200 transition-colors">
                      <SelectValue placeholder="+ ADD CHARGE" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {OTHER_CHARGES?.data.map((charge) => (
                        <SelectItem
                          key={charge.id}
                          value={charge.id.toString()}
                        >
                          {charge.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {checkoutDetails.otherCharges.map((oc) => (
                    <div
                      key={oc.otherChargeId}
                      className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 group transition-all hover:border-primary/20"
                    >
                      <span className="flex-1 text-[11px] font-bold text-slate-700">
                        {oc.name}
                      </span>

                      <div className="relative flex-1">
                        <button
                          onClick={() => {
                            setNumpadConfig({
                              open: true,
                              title: `${oc.name} Amount`,
                              currentValue: oc.amount || 0,
                              onConfirm: (value: number) =>
                                updateChargeAmount(oc.otherChargeId, value),
                              suffix: "Ks",
                            });
                          }}
                          className="w-full h-8 px-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 rounded text-xs font-bold text-slate-700 hover:text-primary transition-all text-right"
                        >
                          {oc.amount?.toLocaleString() || "0"}
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        onClick={() => removeOtherCharge(oc.otherChargeId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments Section - Odoo Style */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Payment
                  </Label>
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={addPaymentMethod}
                  >
                    <SelectTrigger className="h-8 w-fit gap-2 rounded-full bg-primary/10 border-none text-[10px] font-black px-4 hover:bg-primary/20 transition-colors text-primary">
                      <SelectValue placeholder="+ ADD PAYMENT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PAYMENT_METHODS?.data.map((method) => (
                        <SelectItem
                          key={method.id}
                          value={method.id.toString()}
                        >
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Payments List - Compact */}
                <div className="space-y-2">
                  {checkoutDetails.payment.map((p) => {
                    const isDeductionTarget = p.showValue && balance > 0;

                    return (
                      <div
                        key={p.paymentMethodId}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all",
                          isDeductionTarget
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-slate-50/50 border-slate-200",
                        )}
                      >
                        {/* Payment Name */}
                        <span className="text-xs font-bold text-slate-700 min-w-[80px]">
                          {p.name}
                        </span>

                        {/* Amount Input */}
                        <div className="relative flex-1">
                          <button
                            onClick={() => {
                              setNumpadConfig({
                                open: true,
                                title: `${p.name} Amount`,
                                currentValue: p.amount || 0,
                                onConfirm: (value: number) =>
                                  updatePayment(p.paymentMethodId, {
                                    amount: value,
                                  }),
                                suffix: "Ks",
                              });
                            }}
                            className="w-full h-8 px-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 rounded text-xs font-bold text-slate-700 hover:text-primary transition-all text-right"
                          >
                            {p.amount?.toLocaleString() || "0"}
                          </button>
                        </div>

                        {/* Change Indicator */}
                        {isDeductionTarget && (
                          <span className="text-[10px] font-bold text-emerald-600 min-w-[60px] text-right">
                            -{balance.toLocaleString()}
                          </span>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0"
                          onClick={() => removePayment(p.paymentMethodId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Remarks
                </Label>
                <Textarea
                  placeholder="Add notes for this order..."
                  className="min-h-[80px] rounded-xl border-slate-200 text-xs resize-none"
                  value={checkoutDetails.remark}
                  onChange={(e) => setSelectedRemark(e.target.value)}
                />
              </div>
            </div>

            {/* 3. Summary Section */}
            <div className="bg-slate-900 rounded-[2rem] p-6 space-y-4 shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="space-y-2 relative z-10">
                {/* Global Discount Input */}
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest group">
                  <span>Global Discount</span>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setNumpadConfig({
                          open: true,
                          title: "Global Discount",
                          currentValue: checkoutDetails.globalDiscount || 0,
                          onConfirm: (val) => setSelectedGlobalDiscount(val),
                          suffix: "Ks",
                        })
                      }
                      className="text-amber-400 hover:text-amber-300 transition-colors border-b border-transparent hover:border-amber-400/50"
                    >
                      -{(checkoutDetails.globalDiscount || 0).toLocaleString()}{" "}
                      Ks
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal + Charges</span>
                  <span className="text-white">
                    {grandTotal.toLocaleString()} Ks
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Amount Paid</span>
                  <span className="text-emerald-400">
                    {totalPaid.toLocaleString()} Ks
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="flex justify-between items-center relative z-10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {balance >= 0 ? "Change Due" : "Balance Due"}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-black",
                      balance === 0
                        ? "text-emerald-400"
                        : balance > 0
                          ? "text-yellow-400"
                          : "text-orange-400",
                    )}
                  >
                    {Math.abs(balance).toLocaleString()}{" "}
                    <span className="text-sm opacity-50 font-medium tracking-normal">
                      Ks
                    </span>
                  </p>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center bg-opacity-10",
                    balance === 0
                      ? "bg-emerald-700 text-white"
                      : balance > 0
                        ? "bg-yellow-700 text-white"
                        : "bg-orange-700 text-white",
                  )}
                >
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
          {viewingQR && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                {/* Top Header for QR View */}
                <div className="space-y-1">
                  <div className="bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mx-auto mb-2">
                    Scan to Pay
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {viewingQR.name}
                  </h3>
                </div>

                {/* The QR Container */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-primary opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100">
                    {/* Replace with p.qrCodeUrl from your data */}
                    <img
                      src={viewingQR.paymentQR}
                      alt="Payment QR"
                      className="w-48 h-48 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Amount Display */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Payable Amount
                  </p>
                  <p className="text-4xl font-black text-slate-900">
                    {(
                      grandTotal -
                      checkoutDetails.payment.reduce((acc, item) => {
                        return acc + item.amount;
                      }, 0)
                    ).toLocaleString()}{" "}
                    <span className="text-lg opacity-40">Ks</span>
                  </p>
                </div>

                {/* Reference info if available */}
                {viewingQR.referenceId && (
                  <div className="bg-slate-100 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500">
                      Ref: {viewingQR.referenceId}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <div className="p-8 pt-0">
                <Button
                  onClick={() => setViewingQR(null)}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 shadow-xl"
                >
                  Done & Close
                </Button>
              </div>
            </div>
          )}
          {/* Footer Section */}
          <DialogFooter className="p-6 bg-slate-50/80 backdrop-blur-sm flex flex-row gap-4">
            <Button
              variant="ghost"
              className="flex-1 h-14 rounded-2xl font-bold text-slate-400 hover:bg-slate-100"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-[2] h-14 rounded-2xl font-black bg-primary text-xl shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform active:scale-95"
              onClick={processFinalOrder}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Numpad Dialog */}
      <NumpadDialog
        open={numpadConfig.open}
        onClose={() => setNumpadConfig({ ...numpadConfig, open: false })}
        title={numpadConfig.title}
        currentValue={numpadConfig.currentValue}
        onConfirm={numpadConfig.onConfirm}
        suffix={numpadConfig.suffix}
      />
    </>
  );
}
