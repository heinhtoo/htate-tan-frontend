/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  ChevronsUpDown,
  CreditCard,
  MessageSquare,
  Minus,
  Plus,
  QrCode,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePanelStore } from "@/store/panelStore";
import { getCarGates } from "../car-gate/car-gate.action";
import { getCustomers } from "../customer/customer.action";
import CustomerForm from "../customer/customer.from";
import type { CustomerResponse } from "../customer/customer.response";
import { getOtherCharges } from "../other-charge/other-charge.action";
import { getPaymentTypes } from "../payment-type/payment-type.action";
import type { ProductResponse } from "../product/product.response";
import { getSetting } from "../setting/setting.action";
import { SettingKey } from "../setting/setting.response";
import POSProductSection from "./pos-product-section";
import { createPOSOrder } from "./pos.action";

// --- REUSABLE CART COMPONENT ---
const CartSection = ({
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  updateQty,
  removeFromCart,
  grandTotal,
  handleCheckout,
  isLoading,
  refetch,
  isCustomer,
}: any) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  // Assuming user and formatAmount are provided via context or props
  const formatAmount = (num: number) => num.toLocaleString() + " Ks";
  const { openPanel } = usePanelStore();

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* --- CUSTOMER SECTION --- */}
      <div className="p-6 bg-white border-b border-slate-100 space-y-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Client Details
          </h3>
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-14 rounded-2xl bg-slate-50 border-none transition-all duration-300",
                open
                  ? "ring-2 ring-primary/20 bg-white shadow-lg"
                  : "hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <User
                    className={cn(
                      "h-4 w-4",
                      selectedCustomer ? "text-primary" : "text-slate-300"
                    )}
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span
                    className={cn(
                      "text-sm font-bold truncate",
                      selectedCustomer ? "text-slate-900" : "text-slate-400"
                    )}
                  >
                    {selectedCustomer
                      ? selectedCustomer.name
                      : "Walk-in Customer"}
                  </span>
                  {selectedCustomer && (
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                      {selectedCustomer.phoneNumber || "No contact info"}
                    </span>
                  )}
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[360px] p-0 shadow-2xl rounded-2xl border-none"
            align="start"
          >
            <Command className="rounded-2xl">
              <CommandInput
                placeholder="Search client name or phone..."
                className="h-12 border-none ring-0 focus:ring-0"
              />
              <CommandList className="max-h-[320px]">
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
                              : "bg-transparent"
                          )}
                        />
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-sm text-slate-900">
                            {c.name}
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

        {selectedCustomer && user?.isAdmin && (
          <div
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between border-none transition-all animate-in fade-in slide-in-from-top-2",
              selectedCustomer.totalDebt > 0
                ? "bg-rose-50/50"
                : "bg-emerald-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl shadow-sm",
                  selectedCustomer.totalDebt > 0
                    ? "bg-white text-rose-500"
                    : "bg-white text-emerald-500"
                )}
              >
                <Wallet className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Account Balance
                </p>
                <p
                  className={cn(
                    "font-black text-lg leading-none",
                    selectedCustomer.totalDebt > 0
                      ? "text-rose-600"
                      : "text-emerald-600"
                  )}
                >
                  {formatAmount(selectedCustomer.totalDebt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CART ITEMS LIST --- */}
      <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-hide bg-[#F8FAFC]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-60">
            <div className="h-24 w-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-sm font-bold tracking-tight">Basket is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item: any) => (
              <div
                key={`${item.id}-${item.selectedUnitName}`}
                className="group flex gap-4 p-4 rounded-[1.5rem] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-transparent hover:border-slate-100"
              >
                <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 p-2 group-hover:bg-white transition-colors">
                  <img
                    src={item.imagePath}
                    className="h-full w-full object-contain mix-blend-multiply"
                    alt=""
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-black text-slate-800 truncate leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {item.selectedUnitName}{" "}
                        <span className="text-primary/50 mx-1">•</span>{" "}
                        {item.price.toLocaleString()} Ks
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-200 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-primary active:scale-90 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      {/* --- NUMERIC INPUT --- */}
                      <Input
                        type="number"
                        className="w-14 h-8 bg-transparent border-none text-center font-black text-sm focus-visible:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) updateQty(item.id, val - item.qty);
                        }}
                      />

                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-primary active:scale-90 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900 leading-none">
                        {(
                          item.price *
                          item.qty *
                          (item.convertedQtyMultiplier || 1)
                        ).toLocaleString()}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Subtotal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CHECKOUT FOOTER --- */}
      <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.04)] rounded-t-[2.5rem]">
        <div className="flex justify-between items-end mb-8 px-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">
              Grand Total
            </span>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">
              {grandTotal.toLocaleString()}
              <span className="text-sm font-bold text-slate-300 ml-2 tracking-normal uppercase">
                Ks
              </span>
            </p>
          </div>
          {selectedCustomer?.totalDebt > 0 && (
            <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center shadow-inner">
              <AlertCircle className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
          )}
        </div>

        <Button
          className={cn(
            "w-full h-20 rounded-[1.5rem] text-xl font-black shadow-2xl transition-all duration-300 active:scale-[0.97] hover:-translate-y-1",
            selectedCustomer?.totalDebt > 0
              ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
          )}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isLoading}
        >
          {isLoading ? (
            <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="mr-3 h-6 w-6 opacity-50" />
              {selectedCustomer?.totalDebt > 0
                ? "POST TO DEBT"
                : "CHECKOUT NOW"}
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

  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    carGateId?: number;
    otherCharges: {
      otherChargeId: number;
      amount: number;
      name: string;
    }[];
    payment: {
      paymentMethodId: number;
      amount: number;
      referenceId?: string;
      name: string;
      paymentQR: string;
      showValue: boolean;
    }[];
    remark: string;
  }>({
    carGateId: undefined,
    otherCharges: [],
    payment: [],
    remark: "",
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
        (r) => r.response
      ),
  });
  const { data: CAR_GATES } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: () =>
      getCarGates({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });
  const { data: PAYMENT_METHODS } = useQuery({
    queryKey: ["payment-method-all"],
    queryFn: () =>
      getPaymentTypes({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });

  const { data: CUSTOMERS, refetch: refetchCustomers } = useQuery({
    queryKey: ["customer-all"],
    queryFn: () =>
      getCustomers({ page: "0", size: "0", s: "", q: "", isCustomer }).then(
        (r) => r.response
      ),
  });

  const addToCart = (
    product: ProductResponse,
    multiplier: number,
    unitName: string
  ) => {
    if (STOCK_SETTING === "false" && product.totalCurrentStock <= 0) {
      toast.error("There are no stock available", {
        position: "top-center",
      });
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.selectedUnitName === unitName
      );
      if (existing)
        return prev.map((i) =>
          i.id === product.id && i.selectedUnitName === unitName
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          selectedUnitName: unitName,
          convertedQtyMultiplier: multiplier,
        },
      ];
    });
    toast.success(`${product.name} added to cart`, {
      position: "top-center",
    });
  };

  const otherChargesTotal = checkoutDetails.otherCharges.reduce(
    (sum, oc) => sum + (oc.amount || 0),
    0
  );

  const itemTotal = cart.reduce(
    (acc, i) => acc + i.price * i.qty * (i.convertedQtyMultiplier || 1),
    0
  );
  const grandTotal = itemTotal + otherChargesTotal;

  const [isLoading, startTransition] = useTransition();
  const [selectedOtherChargeId, setSelectedOtherChargeId] = useState("");

  function handleCheckout() {
    const isOverLimit =
      LIMIT_SETTING === "true" &&
      selectedCustomer &&
      selectedCustomer.totalDebt &&
      selectedCustomer.creditLimit &&
      selectedCustomer?.totalDebt > selectedCustomer?.creditLimit;

    if (isOverLimit && user?.isAdmin) {
      const proceed = window.confirm(
        "Total debt exceeds credit limit. Do you want to proceed anyway?"
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
          (p) => p.showValue === true
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
              (finalizedPayments[lastIdx].amount || 0) - balance
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
        isCustomer,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Sale completed with order no: " + response?.result.payload.id
      );
      queryClient.invalidateQueries({
        queryKey: ["product-all"],
      });
      refetchCustomers();
      setCart([]);
      setCheckoutDetails({
        carGateId: undefined,
        otherCharges: [],
        payment: [],
        remark: "",
      });
      setIsMobileCartOpen(false);
      setIsConfirmDialogOpen(false); // Close dialog
    });
  }

  const addOtherCharge = (chargeId: string) => {
    setSelectedOtherChargeId("");

    const charge = OTHER_CHARGES?.data.find(
      (c: any) => c.id.toString() === chargeId
    );
    if (!charge) return;

    // Prevent duplicate selection
    if (
      checkoutDetails.otherCharges.some((oc) => oc.otherChargeId === charge.id)
    ) {
      toast.error("Charge already added");
      return;
    }

    setCheckoutDetails((prev) => ({
      ...prev,
      otherCharges: [
        ...prev.otherCharges,
        { otherChargeId: charge.id, amount: 0, name: charge.name },
      ],
    }));
  };

  const updateChargeAmount = (id: number, amount: number) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      otherCharges: prev.otherCharges.map((oc) =>
        oc.otherChargeId === id ? { ...oc, amount } : oc
      ),
    }));
  };

  const removeOtherCharge = (id: number) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      otherCharges: prev.otherCharges.filter((oc) => oc.otherChargeId !== id),
    }));
  };

  const addPaymentMethod = (methodId: string) => {
    const method = PAYMENT_METHODS?.data.find(
      (p: any) => p.id.toString() === methodId
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
      setCheckoutDetails({
        ...checkoutDetails,
        payment: [...checkoutDetails.payment, newPayment],
      });
    }
  };

  const updatePayment = (
    id: number,
    data: Partial<{ amount: number; referenceId: string }>
  ) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      payment: prev.payment.map((p) =>
        p.paymentMethodId === id ? { ...p, ...data } : p
      ),
    }));
  };

  const removePayment = (id: number) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      payment: prev.payment.filter((p) => p.paymentMethodId !== id),
    }));
  };

  const totalPaid = checkoutDetails.payment.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
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
            isLoading={isLoading}
            cart={cart}
            customers={CUSTOMERS?.data || []}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            updateQty={(id: any, delta: any) => {
              setCart((prev) =>
                prev
                  .map((i) =>
                    i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
                  )
                  .filter((i) => i.qty > 0)
              );
            }}
            removeFromCart={(id: any) =>
              setCart((c) => c.filter((i) => i.id !== id))
            }
            grandTotal={grandTotal}
            handleCheckout={handleCheckout}
          />
        </aside>

        {/* MOBILE TRIGGER */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
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
              <CartSection
                refetch={() => {
                  refetchCustomers();
                }}
                cart={cart}
                isLoading={isLoading}
                customers={CUSTOMERS?.data || []}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                updateQty={(id: any, delta: any) => {
                  setCart((prev) =>
                    prev
                      .map((i) =>
                        i.id === id
                          ? { ...i, qty: Math.max(0, i.qty + delta) }
                          : i
                      )
                      .filter((i) => i.qty > 0)
                  );
                }}
                removeFromCart={(id: any) =>
                  setCart((c) => c.filter((i) => i.id !== id))
                }
                grandTotal={grandTotal}
                handleCheckout={handleCheckout}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          {/* Header Section */}
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
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

          <div className="px-8 pb-8 max-h-[65vh] overflow-y-auto space-y-8 scrollbar-hide">
            {/* 1. Logistics & Remarks Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Car Gate
                </Label>
                <Select
                  onValueChange={(v) =>
                    setCheckoutDetails({
                      ...checkoutDetails,
                      carGateId: parseInt(v),
                    })
                  }
                >
                  <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all">
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
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Remark
                </Label>
                <Input
                  placeholder="Notes..."
                  className="h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20"
                  onChange={(e) =>
                    setCheckoutDetails({
                      ...checkoutDetails,
                      remark: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* 2. Charges & Payments Section */}
            <div className="space-y-6">
              {/* Other Charges */}
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
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
                      <div className="relative">
                        <Input
                          type="number"
                          className="h-9 w-28 rounded-xl bg-white border-slate-200 text-right font-black text-xs pr-7"
                          value={oc.amount || ""}
                          onChange={(e) =>
                            updateChargeAmount(
                              oc.otherChargeId,
                              Number(e.target.value)
                            )
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          Ks
                        </span>
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

              {/* Payments Section */}
              <div className="space-y-8">
                {/* Payment Methods Selector (Visual Grid) */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-black uppercase text-indigo-500 tracking-widest">
                      Select Payment Method
                    </Label>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Tap a method to add to this order
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {PAYMENT_METHODS?.data.map((method) => {
                      const isSelected = checkoutDetails.payment.some(
                        (p) => p.paymentMethodId === method.id
                      );
                      return (
                        <button
                          key={method.id}
                          onClick={() => addPaymentMethod(method.id.toString())}
                          disabled={isSelected}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2",
                            isSelected
                              ? "bg-indigo-50 border-indigo-200 opacity-50 cursor-not-allowed"
                              : "bg-white border-slate-100 hover:border-indigo-400 hover:shadow-md active:scale-95"
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-xl",
                              isSelected
                                ? "bg-indigo-200 text-indigo-600"
                                : "bg-slate-50 text-slate-500"
                            )}
                          >
                            <Wallet className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">
                            {method.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Payments List */}

                {checkoutDetails.payment.map((p) => {
                  // Logic to calculate if this specific line is the one being deducted
                  const isDeductionTarget = p.showValue && balance > 0;
                  const netAmount = isDeductionTarget
                    ? p.amount - balance
                    : p.amount;

                  return (
                    <div
                      key={p.paymentMethodId}
                      className={cn(
                        "group relative bg-white rounded-[1.5rem] border transition-all overflow-hidden",
                        isDeductionTarget
                          ? "border-emerald-200 shadow-md"
                          : "border-slate-200 shadow-sm"
                      )}
                    >
                      {/* 1. Header with Status Pulse */}
                      <div className="flex items-center p-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full animate-pulse",
                                  isDeductionTarget
                                    ? "bg-emerald-500"
                                    : "bg-indigo-500"
                                )}
                              />
                              <span className="text-xs font-black text-slate-800 uppercase">
                                {p.name}
                              </span>
                              {p.showValue && (
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                                  CASH
                                </span>
                              )}
                            </div>

                            {/* Show Deduction Badge if applicable */}
                            {isDeductionTarget && (
                              <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2">
                                <span className="text-[10px] font-bold text-rose-500">
                                  -{balance.toLocaleString()} Change
                                </span>
                                <div className="h-4 w-[1px] bg-slate-200" />
                                <span className="text-[10px] font-black text-emerald-600">
                                  Net: {netAmount.toLocaleString()} Ks
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 2. Inputs */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Input
                                type="number"
                                className={cn(
                                  "h-10 rounded-xl border-none text-sm font-black pl-8 transition-colors",
                                  isDeductionTarget
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-50 text-indigo-600"
                                )}
                                value={p.amount || ""}
                                onChange={(e) =>
                                  updatePayment(p.paymentMethodId, {
                                    amount: Number(e.target.value),
                                  })
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                Ks
                              </span>
                            </div>
                            <Input
                              placeholder="Ref / Txn ID"
                              className="h-10 rounded-xl bg-slate-50 border-none text-[11px] font-medium"
                              value={p.referenceId || ""}
                              onChange={(e) =>
                                updatePayment(p.paymentMethodId, {
                                  referenceId: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* 3. Actions */}
                        <div className="flex flex-col gap-1 border-l border-slate-100 pl-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            onClick={() => setViewingQR(p)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                            onClick={() => removePayment(p.paymentMethodId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Summary Section */}
            <div className="bg-slate-900 rounded-[2rem] p-6 space-y-4 shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="space-y-2 relative z-10">
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
                          : "text-orange-400"
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
                        : "bg-orange-700 text-white"
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
    </>
  );
}
