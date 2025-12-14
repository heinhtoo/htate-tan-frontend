/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChevronUp,
  CreditCard,
  Minus,
  Plus,
  RefreshCcw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../category/category.action";
import { getCustomers } from "../customer/customer.action";
import { getProducts } from "../product/product.action";
import type { ProductResponse } from "../product/product.response";
import { UnitSelectionSheet } from "./unit-conversion.sheet";

type CartItem = ProductResponse & {
  qty: number;
  selectedUnitName?: string;
  convertedQtyMultiplier?: number;
};

type Customer = {
  id: string;
  name: string;
};

// --- ♻️ Reusable Cart Component (Logic Shared between Desktop Sidebar & Mobile Sheet) ---
const CartSection = ({
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  updateQty,
  removeFromCart,
  subTotal,
  grandTotal,
  handleCheckout,
}: any) => {
  const getItemDisplay = (item: CartItem) => {
    const unitName = item.selectedUnitName || "Unit";
    const baseQty = item.qty * (item.convertedQtyMultiplier || 1);
    const totalPrice = item.price * baseQty;

    const description =
      item.convertedQtyMultiplier && item.convertedQtyMultiplier > 1
        ? `(${item.convertedQtyMultiplier} base units each)`
        : "";

    return { baseQty, totalPrice, description, unitName };
  };
  return (
    <div className="flex flex-col h-full">
      {/* Customer Select */}
      <div className="p-4 border-b bg-gray-50/50">
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
          ဝယ်ယူသူ ရွေးချယ်ပါ (Customer)
        </label>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-full bg-white h-10">
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c: Customer) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 mt-10">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p className="text-sm">ဈေးခြင်းတောင်း ဗလာဖြစ်နေပါသည်</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {cart.map((item: CartItem) => {
                const { baseQty, totalPrice, description, unitName } =
                  getItemDisplay(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white p-2.5 rounded-lg border shadow-sm"
                  >
                    {/* Small Image in Cart */}
                    <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={item.imagePath}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 truncate">
                        {item.name}
                      </h4>
                      {/* New: Display unit and total base units */}
                      <div className="text-xs text-gray-500">
                        Selling {item.qty} {unitName} {description}
                      </div>
                      <div className="text-xs text-primary font-bold mt-1">
                        {totalPrice.toLocaleString()} Ks
                      </div>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm bg-white shadow-sm"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">
                          {item.qty} {unitName[0].toUpperCase()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm bg-white shadow-sm"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({baseQty} Base Units)
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer Totals */}
      <div className="p-4 bg-white border-t space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{subTotal.toLocaleString()} Ks</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>စုစုပေါင်း (Total)</span>
            <span>{grandTotal.toLocaleString()} Ks</span>
          </div>
        </div>
        <Button
          className="w-full h-11 text-md gap-2"
          size="lg"
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          <CreditCard className="h-5 w-5" />
          ငွေရှင်းမည် (Checkout)
        </Button>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function PosPage() {
  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);
  const [selectedProductForUnit, setSelectedProductForUnit] =
    useState<ProductResponse | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const { data: MOCK_CUSTOMERS, refetch: refetchCustomer } = useQuery({
    queryKey: ["customer-all"],
    queryFn: async () => {
      const data = await getCustomers({
        page: "0",
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

  const { data: MOCK_PRODUCTS, refetch: refetchProduct } = useQuery({
    queryKey: ["product-all"],
    queryFn: async () => {
      const data = await getProducts({
        page: "0",
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

  const { data: CATEGORIES, refetch: refetchCategory } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const data = await getCategories({
        page: "0",
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

  useEffect(() => {
    if (MOCK_CUSTOMERS) {
      setSelectedCustomer(MOCK_CUSTOMERS.data[0].id);
    }
  }, [MOCK_CUSTOMERS]);

  const refetch = () => {
    refetchProduct();
    refetchCategory();
    refetchCustomer();
  };

  // Logic: Filter Products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS?.data?.filter((product) => {
      const matchesCategory =
        selectedCategory === -1 || product.category.id === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, MOCK_PRODUCTS?.data]);

  // Logic: Cart Management
  const handleProductClick = (product: ProductResponse) => {
    // Check if the product has unit conversions defined
    if (product.unitConversions && product.unitConversions.length > 0) {
      setSelectedProductForUnit(product);
      setIsUnitSheetOpen(true);
    } else {
      // If no conversions, add a single unit directly (original logic)
      addToCart(product, 1, "Unit");
    }
  };

  // Logic: Add to Cart (Modified to accept multiplier and unit details)
  const addToCart = (
    product: ProductResponse,
    qtyMultiplier: number,
    unitName: string
  ) => {
    // The quantity added is always 1 for the selected unit, but the base unit multiplier is stored
    setCart((prev) => {
      // Find existing item that matches BOTH product ID AND unit
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedUnitName === unitName
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedUnitName === unitName
            ? { ...item, qty: item.qty + 1 } // Increment the count of the chosen unit (e.g., 2 Dozen)
            : item
        );
      }

      // If adding a new item/unit type
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          selectedUnitName: unitName,
          convertedQtyMultiplier: qtyMultiplier,
        },
      ];
    });

    // Calculate the total base units added for the toast message
    const totalBaseUnits = qtyMultiplier;

    toast.success(`Added ${totalBaseUnits} base units (${unitName}) to cart`, {
      position: "top-center",
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.qty + delta);
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (!selectedCustomer) {
      toast.error("ကျေးဇူးပြု၍ ဝယ်ယူသူအမည် ရွေးချယ်ပေးပါ။");
      return;
    }
    toast.success("အရောင်းစာရင်း သွင်းပြီးပါပြီ။");
    setCart([]);
    setSelectedCustomer("");
    setIsMobileCartOpen(false);
  };

  const subTotal = cart.reduce((acc, item) => {
    // Use the stored multiplier for pricing
    const effectiveQty = item.qty * (item.convertedQtyMultiplier || 1);
    return acc + item.price * effectiveQty;
  }, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const grandTotal = subTotal; // Add tax logic if needed

  // Common Props for CartSection
  const cartProps = {
    cart,
    customers: MOCK_CUSTOMERS?.data ?? [],
    selectedCustomer,
    setSelectedCustomer,
    updateQty,
    removeFromCart,
    subTotal,
    grandTotal,
    handleCheckout,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden relative">
      <Button
        className="fixed top-3 right-3 z-50"
        size="icon"
        onClick={() => {
          refetch();
        }}
      >
        <RefreshCcw />
      </Button>
      {/* ---------------- LEFT SIDE: PRODUCTS ---------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full lg:w-auto">
        {/* Header */}
        <div className="bg-white p-3 border-b flex flex-col gap-3 shadow-sm z-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Tabs
              defaultValue="all"
              value={selectedCategory + ""}
              onValueChange={(value) => {
                setSelectedCategory(parseInt(value));
              }}
              className="w-full"
            >
              <TabsList className="h-9">
                <TabsTrigger value={-1 + ""} className="text-xs px-3">
                  All
                </TabsTrigger>
                {CATEGORIES?.data.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id + ""}
                    className="text-xs px-3"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-9 h-9 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1 px-3 py-4">
          {/* Add padding bottom on mobile so sticky bar doesn't cover content */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-24 lg:pb-0">
            {filteredProducts?.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary/50 transition-all group overflow-hidden border-gray-200 shadow-sm py-0 my-0"
                onClick={() => handleProductClick(product)}
              >
                <div className="aspect-[4/3] relative bg-gray-100">
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    className="object-cover w-full h-full mix-blend-multiply p-3"
                  />
                  <Badge className="absolute top-1.5 right-1.5 text-[10px] bg-white/90 text-black hover:bg-white shadow-sm backdrop-blur-sm">
                    Stock:{" "}
                    {product.stocks.reduce(
                      (acc, item) => acc + item.currentQuantity,
                      0
                    )}
                  </Badge>
                </div>
                <div className="p-2.5">
                  <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-gray-700">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-sm mt-1">
                    {product.price.toLocaleString()} Ks
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ---------------- RIGHT SIDE: CART (DESKTOP) ---------------- */}
      {/* Hidden on Mobile (lg:flex) */}
      <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-col h-full border-l bg-white shadow-xl z-20">
        <div className="p-4 border-b flex items-center gap-2 font-semibold text-lg bg-gray-50/30">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span>Current Order</span>
          <Badge variant="secondary" className="ml-auto">
            {totalItems} items
          </Badge>
        </div>
        <CartSection {...cartProps} />
      </div>

      {/* ---------------- MOBILE STICKY BOTTOM BAR ---------------- */}
      {/* Visible only on Mobile (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
          <SheetTrigger asChild>
            <div className="bg-white border-t p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center justify-between cursor-pointer active:bg-gray-50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-0.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>{totalItems} Items</span>
                  <ChevronUp className="h-3 w-3 animate-bounce" />
                </div>
                <div className="text-lg font-bold text-primary">
                  {grandTotal.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-gray-600">Ks</span>
                </div>
              </div>

              <Button
                size="default"
                className="gap-2 px-6 h-10 shadow-lg shadow-primary/20 rounded-full"
              >
                View Cart
              </Button>
            </div>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="h-[85vh] p-0 flex flex-col rounded-t-2xl"
          >
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Cart Summary
                </SheetTitle>
              </div>
            </SheetHeader>
            {/* Render the shared Cart Section inside the mobile sheet */}
            <CartSection {...cartProps} />
          </SheetContent>
        </Sheet>
      </div>
      {selectedProductForUnit && (
        <UnitSelectionSheet
          product={selectedProductForUnit}
          isOpen={isUnitSheetOpen}
          onOpenChange={setIsUnitSheetOpen}
          onSelectUnit={(unitName, multiplier) => {
            // This callback is triggered when the user confirms selection
            addToCart(selectedProductForUnit, multiplier, unitName);
            setSelectedProductForUnit(null); // Clear product context
          }}
        />
      )}
    </div>
  );
}
