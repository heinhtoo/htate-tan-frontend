/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  BadgeCheck,
  Check,
  ChevronsUpDown,
  CreditCard,
  FilterX,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";

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
import { formatAmount } from "@/lib/textHelper";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { getBrands } from "../brand/brand.action";
import { getCarGates } from "../car-gate/car-gate.action";
import { getCategories } from "../category/category.action";
import { getCustomers } from "../customer/customer.action";
import type { CustomerResponse } from "../customer/customer.response";
import { getOtherCharges } from "../other-charge/other-charge.action";
import { getPaymentTypes } from "../payment-type/payment-type.action";
import { getProducts } from "../product/product.action";
import type { ProductResponse } from "../product/product.response";
import { getSetting } from "../setting/setting.action";
import { SettingKey } from "../setting/setting.response";
import { createPOSOrder } from "./pos.action";
import { UnitSelectionSheet } from "./unit-conversion.sheet";

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
}: any) => {
  const [open, setOpen] = useState(false);

  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Searchable Customer Header */}
      <div className="p-4 border-b bg-slate-50 space-y-3">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Customer Info
          </span>
          {selectedCustomer && (
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-[10px] flex items-center gap-1 hover:text-red-500 transition-colors font-bold uppercase"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Searchable Customer Combobox */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12 rounded-xl bg-white border-slate-200 shadow-sm font-normal text-slate-600"
            >
              {selectedCustomer ? (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-bold text-slate-900 truncate w-full text-left">
                    {selectedCustomer?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate w-full text-left">
                    {selectedCustomer?.phoneNumber || "No phone"}
                  </span>
                </div>
              ) : (
                "Default Walk In Customer"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] p-0 shadow-2xl rounded-xl border-slate-200"
            align="start"
          >
            <Command className="rounded-xl">
              <CommandInput
                placeholder="Type name or phone..."
                className="h-11"
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty className="p-4 text-center text-sm text-slate-500">
                  No customer found.
                </CommandEmpty>
                <CommandGroup>
                  {customers.map((c: CustomerResponse) => (
                    <CommandItem
                      key={c.id}
                      value={`${c.name} ${c.phoneNumber}`}
                      onSelect={() => {
                        setSelectedCustomer(c);
                        setOpen(false);
                      }}
                      className="p-3 cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          selectedCustomer?.id === c.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900">
                          {c.name}
                        </span>
                        <div className="flex gap-3 mt-1">
                          {c.phoneNumber && (
                            <span className="text-[10px] flex items-center gap-1 text-slate-500">
                              <Phone className="h-3 w-3" /> {c.phoneNumber}
                            </span>
                          )}
                          {c.address && (
                            <span className="text-[10px] flex items-center gap-1 text-slate-500 truncate max-w-[150px]">
                              <MapPin className="h-3 w-3" /> {c.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Balance Display */}
        {selectedCustomer && user?.isAdmin && (
          <div
            className={`p-3 rounded-2xl flex items-center justify-between border-2 transition-all ${
              selectedCustomer.totalDebt > 0
                ? "bg-red-50 border-red-100"
                : "bg-emerald-50 border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${selectedCustomer.totalDebt > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
              >
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                  Debt Balance
                </p>
                <p
                  className={`font-black text-base ${selectedCustomer.totalDebt > 0 ? "text-red-700" : "text-emerald-700"}`}
                >
                  {formatAmount(selectedCustomer.totalDebt)}
                </p>
              </div>
            </div>
            {selectedCustomer.totalDebt > 0 && (
              <Badge
                variant="destructive"
                className="animate-pulse text-[9px] px-2 h-5 rounded-full"
              >
                Overdue
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <ScrollArea className="flex-1 px-4 py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 py-20">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">Your basket is empty</p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {cart.map((item: any) => (
              <div
                key={`${item.id}-${item.selectedUnitName}`}
                className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-16 rounded-xl bg-slate-50 border overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img
                    src={item.imagePath}
                    className="h-full w-full object-contain"
                    alt=""
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-primary font-bold mt-0.5 tracking-tight">
                      {item.selectedUnitName} @ {item.price.toLocaleString()} Ks
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-7 w-7 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-transform"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-black px-1 min-w-[20px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-transform"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {(
                        item.price *
                        item.qty *
                        (item.convertedQtyMultiplier || 1)
                      ).toLocaleString()}{" "}
                      Ks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="self-start text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Checkout Section */}
      <div className="p-4 border-t bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <div className="flex justify-between items-end mb-5 px-1">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2 block">
              Grand Total
            </span>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              {grandTotal.toLocaleString()}{" "}
              <span className="text-sm font-medium text-slate-400">Ks</span>
            </p>
          </div>
          {selectedCustomer?.totalDebt > 0 && (
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
          )}
        </div>
        <Button
          className={cn(
            "w-full h-16 rounded-2xl text-lg font-black shadow-xl transition-all active:scale-95",
            selectedCustomer?.totalDebt > 0
              ? "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
              : "bg-primary hover:bg-primary/90 shadow-blue-200"
          )}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isLoading}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {selectedCustomer?.totalDebt > 0 ? "ADD TO DEBT" : "COMPLETE SALE"}
        </Button>
      </div>
    </div>
  );
};

export default function PosPage() {
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [selectedBrand, setSelectedBrand] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedProductForUnit, setSelectedProductForUnit] =
    useState<ProductResponse | null>(null);
  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const { data: PRODUCTS, refetch: refetchProducts } = useQuery({
    queryKey: ["product-all"],
    queryFn: () =>
      getProducts({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });
  const { data: CATEGORIES } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () =>
      getCategories({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });
  const { data: BRANDS } = useQuery({
    queryKey: ["brands-all"],
    queryFn: () =>
      getBrands({ page: "0", size: "0", s: "", q: "" }).then((r) => r.response),
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
      getCustomers({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });

  const filteredProducts = useMemo(() => {
    return PRODUCTS?.data?.filter((p) => {
      const matchCat =
        selectedCategory === -1 || p.category.id === selectedCategory;
      const matchBrand = selectedBrand === -1 || p.brand.id === selectedBrand;
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCat && matchBrand && matchSearch;
    });
  }, [PRODUCTS, selectedCategory, selectedBrand, searchQuery]);

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
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [selectedOtherChargeId, setSelectedOtherChargeId] = useState("");

  function handleCheckout() {
    const isOverLimit =
      LIMIT_SETTING === "true" &&
      selectedCustomer &&
      selectedCustomer.totalDebt &&
      selectedCustomer.creditLimit &&
      selectedCustomer?.totalDebt > selectedCustomer?.creditLimit;

    if (isOverLimit) {
      const proceed = window.confirm(
        "Total debt exceeds credit limit. Do you want to proceed anyway?"
      );
      if (!proceed) return; // Exit the function if they click 'Cancel'
    }

    setIsConfirmDialogOpen(true);
  }

  async function processFinalOrder() {
    startTransition(async () => {
      const { error, response } = await createPOSOrder({
        cart,
        selectedCustomer,
        ...checkoutDetails,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Sale completed with order no: " + response?.result.payload.id
      );
      refetchProducts();
      refetchCustomers();
      setCart([]);
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
    setSelectedPaymentMethodId("");

    const method = PAYMENT_METHODS?.data.find(
      (p: any) => p.id.toString() === methodId
    );
    if (!method) return;

    if (checkoutDetails.payment.some((p) => p.paymentMethodId === method.id)) {
      toast.error("Payment method already added");
      return;
    }

    setCheckoutDetails((prev) => ({
      ...prev,
      payment: [
        ...prev.payment,
        {
          paymentMethodId: method.id,
          amount: 0,
          referenceId: "",
          name: method.name,
        },
      ],
    }));
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

  return (
    <>
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white p-4 space-y-4 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  ref={searchInputRef}
                  placeholder="Find products... (Ctrl + F)"
                  className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {(selectedCategory !== -1 ||
                selectedBrand !== -1 ||
                searchQuery) && (
                <Button
                  variant="ghost"
                  className="h-12 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                  onClick={() => {
                    setSelectedCategory(-1);
                    setSelectedBrand(-1);
                    setSearchQuery("");
                  }}
                >
                  <FilterX className="h-4 w-4 mr-2" /> Reset
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Categories Section */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 shrink-0">
                  Category
                </span>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    <Badge
                      variant={
                        selectedCategory === -1 ? "default" : "secondary"
                      }
                      className="px-4 py-1.5 cursor-pointer rounded-full transition-all border-none"
                      onClick={() => setSelectedCategory(-1)}
                    >
                      All Categories
                    </Badge>
                    {CATEGORIES?.data.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant={
                          selectedCategory === cat.id ? "default" : "secondary"
                        }
                        className={`px-4 py-1.5 cursor-pointer rounded-full transition-all border-none ${selectedCategory === cat.id ? "shadow-lg shadow-blue-200" : ""}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
              </div>

              {/* Brands Section */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 shrink-0">
                  Brand
                </span>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    <Badge
                      variant={selectedBrand === -1 ? "default" : "secondary"}
                      className="px-4 py-1.5 cursor-pointer rounded-full transition-all border-none"
                      onClick={() => setSelectedBrand(-1)}
                    >
                      All Brands
                    </Badge>
                    {BRANDS?.data.map((brand) => (
                      <Badge
                        key={brand.id}
                        variant={
                          selectedBrand === brand.id ? "default" : "secondary"
                        }
                        className={`px-4 py-1.5 cursor-pointer rounded-full transition-all border-none ${selectedBrand === brand.id ? "shadow-lg shadow-blue-200" : ""}`}
                        onClick={() => setSelectedBrand(brand.id)}
                      >
                        {brand.name}
                      </Badge>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
              </div>
            </div>
          </header>

          <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredProducts?.length || 0} Products Found
              </h2>
            </div>

            <ScrollArea className="flex-1 p-4 lg:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5 pb-28 lg:pb-0">
                {filteredProducts?.map((product) => (
                  <Card
                    key={product.id}
                    className="group p-0 flex flex-col border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer rounded-md overflow-hidden bg-white"
                    onClick={() => {
                      product.unitConversions?.length
                        ? (setSelectedProductForUnit(product),
                          setIsUnitSheetOpen(true))
                        : addToCart(product, 1, "Unit");
                    }}
                  >
                    <div className="aspect-square bg-slate-50/50 flex items-center justify-center relative">
                      <img
                        src={product.imagePath}
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        alt=""
                      />
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                        <Badge className="bg-white/80 text-slate-900 backdrop-blur-md border-none text-[9px] font-bold uppercase">
                          {product.brand.name}
                        </Badge>
                        {/* Visual Stock Indicator */}
                        <Badge
                          className={cn(
                            "border-none text-[9px] font-bold",
                            product.totalCurrentStock <= 0
                              ? "bg-red-500 text-white"
                              : product.totalCurrentStock < 5
                                ? "bg-orange-100 text-orange-600"
                                : "bg-emerald-100 text-emerald-600"
                          )}
                        >
                          Stock: {product.totalCurrentStock}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 leading-relaxed h-8">
                        {product.name}
                      </h3>
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Price
                          </p>
                          <p className="text-sm font-black text-primary tracking-tight">
                            {product.price.toLocaleString()} Ks
                          </p>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </main>

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

        {selectedProductForUnit && (
          <UnitSelectionSheet
            product={selectedProductForUnit}
            isOpen={isUnitSheetOpen}
            onOpenChange={setIsUnitSheetOpen}
            onSelectUnit={(unitName, multiplier) => {
              addToCart(selectedProductForUnit, multiplier, unitName);
              setSelectedProductForUnit(null);
            }}
          />
        )}
      </div>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              Finalize Order
            </DialogTitle>
            {selectedCustomer &&
              selectedCustomer.totalDebt &&
              selectedCustomer.creditLimit &&
              selectedCustomer?.totalDebt > selectedCustomer?.creditLimit && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-red-600 text-[11px] font-bold mt-2">
                  <AlertCircle className="h-4 w-4" />
                  Warning: Customer credit limit exceeded!
                </div>
              )}
          </DialogHeader>

          <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* 1. Logistics Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                  Car Gate
                </Label>
                <Select
                  onValueChange={(v) =>
                    setCheckoutDetails({
                      ...checkoutDetails,
                      carGateId: parseInt(v),
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl h-10 bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select Gate" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_GATES?.data.map((gate) => (
                      <SelectItem key={gate.id} value={gate.id.toString()}>
                        {gate.gateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                  Remark
                </Label>
                <Input
                  placeholder="Optional notes..."
                  className="h-10 rounded-xl bg-slate-50 border-slate-200"
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
            <div className="space-y-4">
              {/* Other Charges */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-black uppercase text-slate-500">
                    Other Charges
                  </Label>
                  <Select
                    value={selectedOtherChargeId}
                    onValueChange={addOtherCharge}
                  >
                    <SelectTrigger className="h-7 w-32 rounded-lg bg-white text-[11px] font-bold">
                      <SelectValue placeholder="+ Add Charge" />
                    </SelectTrigger>
                    <SelectContent>
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
                      className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100"
                    >
                      <span className="flex-1 text-xs font-bold text-slate-600 pl-2">
                        {oc.name}
                      </span>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          className="h-8 rounded-lg pr-6 text-right font-bold text-xs"
                          value={oc.amount || ""}
                          onChange={(e) =>
                            updateChargeAmount(
                              oc.otherChargeId,
                              Number(e.target.value)
                            )
                          }
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          Ks
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-red-500"
                        onClick={() => removeOtherCharge(oc.otherChargeId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-black uppercase text-blue-600">
                    Payment Methods
                  </Label>
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={addPaymentMethod}
                  >
                    <SelectTrigger className="h-7 w-32 rounded-lg bg-white text-[11px] font-bold border-blue-200">
                      <SelectValue placeholder="+ Add Payment" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  {checkoutDetails.payment.map((p) => (
                    <div
                      key={p.paymentMethodId}
                      className="grid grid-cols-12 gap-2 bg-white p-4 rounded-xl shadow-sm border border-blue-100 items-center"
                    >
                      <div className="col-span-8 flex flex-col gap-3">
                        <p className="font-black text-blue-900 text-xs">
                          {p.name}
                        </p>
                        <div className="col-span-4 relative self-center w-full">
                          <Input
                            type="number"
                            className="h-9 rounded-lg pr-6 text-right font-black text-blue-600"
                            value={p.amount || ""}
                            onChange={(e) =>
                              updatePayment(p.paymentMethodId, {
                                amount: Number(e.target.value),
                              })
                            }
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                            Ks
                          </span>
                        </div>
                      </div>

                      <div className="col-span-4 flex justify-end self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-slate-500"
                          onClick={() => {
                            const paidAmount = checkoutDetails.payment.reduce(
                              (acc, item) => {
                                return acc + item.paymentMethodId ===
                                  p.paymentMethodId
                                  ? 0
                                  : p.amount;
                              },
                              0
                            );
                            updatePayment(p.paymentMethodId, {
                              amount: Number(grandTotal) - paidAmount,
                            });
                          }}
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-red-500"
                          onClick={() => removePayment(p.paymentMethodId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="col-span-12">
                        <Input
                          placeholder="Ref ID"
                          className="rounded-md border-none bg-slate-50 mt-0.5"
                          value={p.referenceId || ""}
                          onChange={(e) =>
                            updatePayment(p.paymentMethodId, {
                              referenceId: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Summary Section (The "Math" Card) */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 shadow-xl">
              <div className="flex justify-between text-xs opacity-70">
                <span>Subtotal + Charges</span>
                <span>{grandTotal.toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between text-xs opacity-70">
                <span>Total Paid</span>
                <span>{totalPaid.toLocaleString()} Ks</span>
              </div>
              <hr className="border-slate-700 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">
                  {balance >= 0 ? "Change Due" : "Balance Remaining"}
                </span>
                <span
                  className={`text-xl font-black ${balance >= 0 ? "text-emerald-400" : "text-orange-400"}`}
                >
                  {Math.abs(balance).toLocaleString()} Ks
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 flex flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold text-slate-500"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-[2] rounded-xl font-black bg-primary h-12 text-lg shadow-lg shadow-primary/20"
              onClick={processFinalOrder}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
