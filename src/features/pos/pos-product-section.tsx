/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FilterX, Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { getBrands } from "../brand/brand.action";
import { getCategories } from "../category/category.action";
import { getProducts } from "../product/product.action";
import type { ProductResponse } from "../product/product.response";
import { UnitSelectionSheet } from "./unit-conversion.sheet";

function POSProductSection({
  addToCart,
}: {
  addToCart: (
    product: ProductResponse,
    multiplier: number,
    unitName: string
  ) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [selectedBrand, setSelectedBrand] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductForUnit, setSelectedProductForUnit] =
    useState<ProductResponse | null>(null);

  const { data: PRODUCTS } = useQuery({
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
  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);

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

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 h-screen lg:h-[calc(100vh-theme(spacing.16))]">
        <header className="bg-white p-4 space-y-4 shadow-sm z-10 shrink-0">
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
              <div className="w-full whitespace-nowrap max-w-[70vw] overflow-x-auto">
                <div className="flex gap-2 pb-2">
                  <Badge
                    variant={selectedCategory === -1 ? "default" : "secondary"}
                    className="px-4 py-1.5 cursor-pointer rounded-full transition-all border-none"
                    onClick={() => setSelectedCategory(-1)}
                  >
                    All Categories
                  </Badge>
                  {CATEGORIES?.data.sort((a,b)=> a.name.localeCompare(b.name))
                    .filter((item) => {
                      if (selectedBrand !== -1) {
                        return filteredProducts?.find(
                          (prod) => prod.category.id === item.id
                        );
                      } else {
                        return true;
                      }
                    })
                    .map((cat) => (
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
              </div>
            </div>

            {/* Brands Section */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 shrink-0">
                Brand
              </span>
              <div className="w-full whitespace-nowrap max-w-[70vw] overflow-x-auto">
                <div className="flex gap-2 pb-2">
                  <Badge
                    variant={selectedBrand === -1 ? "default" : "secondary"}
                    className="px-4 py-1.5 cursor-pointer rounded-full transition-all border-none"
                    onClick={() => setSelectedBrand(-1)}
                  >
                    All Brands
                  </Badge>
                  {BRANDS?.data.sort((a,b)=> a.name.localeCompare(b.name))
                    .filter((item) => {
                      if (selectedCategory !== -1) {
                        return filteredProducts?.find(
                          (prod) => prod.brand.id === item.id
                        );
                      } else {
                        return true;
                      }
                    })
                    .map((brand) => (
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
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col relative">
          <div className="px-6 pt-4 shrink-0 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredProducts?.length || 0} Products Found
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4 lg:p-6 max-h-[65vh] ">
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
                    <h3 className="text-xs font-bold text-slate-800 mb-2 leading-relaxed h-8">
                      {product.name} [{product.sku}]
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
    </>
  );
}

export default POSProductSection;
