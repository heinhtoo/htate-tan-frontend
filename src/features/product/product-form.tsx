/* eslint-disable @typescript-eslint/no-explicit-any */
import BrandDropdown from "@/components/dropdown/brand.dropdown";
import CategoryDropdown from "@/components/dropdown/category.dropdown";
import ProductTypeDropdown from "@/components/dropdown/product-type.dropdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ImageButton from "../media/image-button";
import { createProduct, updateProduct } from "./product.action";
import type { ProductResponse } from "./product.response";
import { ProductSchema } from "./product.schema";

interface ProductFormProps {
  initialData: ProductResponse | null;
  onSubmitComplete: () => void;
}

export default function ProductForm({
  initialData,
  onSubmitComplete,
}: ProductFormProps) {
  const isEditing = !!initialData;
  const { setError } = useErrorStore();
  const { closePanel } = usePanelStore();

  const form = useForm<any>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      // Ensure numbers are not undefined/null
      price: initialData?.price ?? 0,
      description: initialData?.description ?? "",
      imagePath: initialData?.imagePath ?? "",
      lowStockAlertAt: initialData?.lowStockAlertAt ?? 5,
      // Extract IDs from the nested objects if editing, otherwise string empty or undefined
      categoryId: initialData?.category?.id ?? undefined,
      brandId: initialData?.brand?.id ?? undefined,
      productTypeId: initialData?.productType?.id ?? undefined,
      groupId: initialData?.group?.id ?? undefined,
    },
  });

  const { handleSubmit, control, formState } = form;
  const isLoading = formState.isSubmitting;

  /** ----------------------------------------
   * SUBMIT HANDLER
   * -------------------------------------- */
  async function handleFormSubmit(values: z.infer<typeof ProductSchema>) {
    const action = isEditing
      ? updateProduct({
          sku: initialData!.sku,
          data: values,
          version: initialData!.version,
        })
      : createProduct({ data: values });

    const { error } = await action;

    if (error) {
      setError(error as ErrorResponse);
      return;
    }

    toast.success(
      isEditing
        ? `Product "${values.name}" updated successfully.`
        : `New Product "${values.name}" created.`
    );

    onSubmitComplete();
    closePanel();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Row 1: Name & SKU */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Wireless Mouse"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Price & Low Stock Alert */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lowStockAlertAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Alert</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription className="text-xs">
                  Alert when stock dips below this.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Relations (Category & Brand) */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryDropdown
                    value={field.value}
                    setValue={(value) => {
                      field.onChange(value);
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <BrandDropdown
                    value={field.value}
                    setValue={(value) => {
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Product Type */}
        <FormField
          control={control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <FormControl>
                <ProductTypeDropdown
                  value={field.value}
                  setValue={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product details..."
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={control}
          name="imagePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <ImageButton value={field.value} setValue={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={closePanel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
