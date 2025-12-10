import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, User, X } from "lucide-react";

// 💡 Placeholder Components for the Sub-sections
const ProductGrid = () => (
  <div className="p-4 grid grid-cols-3 gap-3">
    {/* Placeholder Product Card */}
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-2 flex flex-col items-center">
        <div className="w-full h-16 bg-gray-200 rounded-md mb-2"></div>
        <p className="text-sm font-medium truncate w-full">Product Name</p>
        <p className="text-xs text-muted-foreground">$19.99</p>
      </CardContent>
    </Card>
    {/* Repeat many times... */}
    <div className="col-span-3 text-center text-sm text-muted-foreground mt-4">
      (Product results from search/category filter)
    </div>
  </div>
);

const CartItemRow = ({ name, quantity, price }: any) => (
  <div className="flex justify-between items-center py-2 border-b last:border-b-0">
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">
          {quantity} x ${price.toFixed(2)}
        </p>
      </div>
    </div>
    <p className="font-semibold">${(quantity * price).toFixed(2)}</p>
  </div>
);

// =========================================================

function POSPage() {
  // 💡 State Management for a real POS would be here (e.g., cart, customer, discounts)
  const cartItems = [
    { id: 1, name: "Premium Umbrella", quantity: 1, price: 29.99 },
    { id: 2, name: "Baseball Cap - Blue", quantity: 2, price: 15.0 },
  ];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="h-full flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4 bg-gray-50">
      {/* 1. Product Selection Area (Takes up most of the horizontal space) */}
      <Card className="flex-grow flex flex-col min-h-full">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Products & Inventory
          </CardTitle>
          {/* Search Bar for Product Lookup (by name, SKU, or barcode) */}
          <div className="w-1/3">
            <Input placeholder="Search product or scan barcode..." />
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-0">
          {/* Category/Brand Filters */}
          <div className="p-3 border-b flex space-x-2 overflow-x-auto scrollbar-hide">
            <Badge variant="default" className="cursor-pointer">
              All Categories
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Hats
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Umbrellas
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              New Arrivals
            </Badge>
            {/* More dynamic categories based on 'category' and 'brand' entities */}
          </div>

          {/* Product Grid */}
          <ScrollArea className="h-[calc(100vh-250px)]">
            <ProductGrid />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 2. Transaction Cart and Payment Area (Fixed Width Sidebar) */}
      <Card className="w-full md:w-[350px] flex-shrink-0 flex flex-col">
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Current Sale</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              <User className="h-4 w-4 mr-2" /> Select Customer
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Customer: **Walk-in** (No Loyalty)
          </p>
        </CardHeader>

        {/* Cart Items List */}
        <CardContent className="flex-grow p-4">
          <ScrollArea className="h-[250px] pr-4">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} {...item} />
            ))}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex flex-col p-4 border-t">
          {/* Price Summary */}
          <div className="w-full space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({taxRate * 100}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total Due:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          <Separator className="my-3" />

          {/* Checkout Button */}
          <Button size="lg" className="w-full h-12">
            Process Payment (${total.toFixed(2)})
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default POSPage;
