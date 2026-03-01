/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  CreditCard,
  Edit,
  FileText,
  Monitor,
  Package,
  Plus,
  Printer,
  Receipt,
  Save,
  Trash2,
  TrendingUp,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import PaymentTypeDropdown from "@/components/dropdown/payment-type.dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getCarGates } from "../car-gate/car-gate.action";
import { getOrderDetails, updateOrder } from "./orders.action";
import { getStatusConfig } from "./orders.page";

import CustomerDropdown from "@/components/dropdown/customer.dropdown";
import OtherChargeDropdown from "@/components/dropdown/other-charge.dropdown";
import DatePicker from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import CarGateForm from "../car-gate/car-gate.from";
import POSProductSection from "../pos/pos-product-section";
import { cancelPOSOrder } from "../pos/pos.action";
import { InvoicePrint } from "./order-print";
import { InvoicePrintV2 } from "./order-print-v2";
import { OrderStatus } from "./order.response";

export default function OrderDetailsPage({
  isCustomer,
}: {
  isCustomer: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuthStore();

  const { data: order } = useQuery({
    queryKey: ["order-details", slug],
    queryFn: () => getOrderDetails({ slug: slug ?? "" }),
  });

  const orderData = order?.response?.data;

  // Initialize Form
  const form = useForm({
    values: {
      carGateId: orderData?.carGate?.id,
      remark: orderData?.remark || "",
      totalAdditionalDiscountAmount: orderData?.totals?.additionalDiscount || 0,
      items: orderData?.items || [],
      payments: orderData?.payments
        ? orderData.payments.map((item) => {
            return {
              referenceId: item.referenceId,
              amount: item.amount,
              paymentMethodId: item.typeId,
              status: item.status,
              paymentId: item.id,
            };
          })
        : [],
      otherCharges: orderData?.otherCharges ? orderData.otherCharges : [],
      orderStatus: orderData?.status,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({ control: form.control, name: "payments" });

  const { data: CAR_GATES, refetch: refetchCarGates } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: () =>
      getCarGates({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response,
      ),
  });
  const { openPanel } = usePanelStore();

  const {
    fields: otherChargesField,
    append: appendOtherCharge,
    remove: removeOtherCharge,
  } = useFieldArray({ control: form.control, name: "otherCharges" });

  const watchedItems = useWatch({ control: form.control, name: "items" }) || [];
  const watchedPayments =
    useWatch({ control: form.control, name: "payments" }) || [];
  const watchedOtherCharges =
    useWatch({ control: form.control, name: "otherCharges" }) || [];

  const watchedDiscount =
    useWatch({
      control: form.control,
      name: "totalAdditionalDiscountAmount",
    }) || 0;

  const totalPaid = useMemo(
    () =>
      watchedPayments
        .filter((p) => p.status === "completed")
        .reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [watchedPayments],
  );
  const totalPlannedPayments = useMemo(
    () => watchedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [watchedPayments],
  );

  const calculatedPayable = useMemo(() => {
    const subtotal = watchedItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.unitPrice * curr.subQuantity,
      0,
    );

    // Calculate total from other charges fields
    const otherChargesTotal = (watchedOtherCharges || []).reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );

    return subtotal + otherChargesTotal - Number(watchedDiscount || 0);
  }, [watchedItems, watchedDiscount, watchedOtherCharges]);

  const remainingAmount = calculatedPayable - totalPlannedPayments;

  const { setError } = useErrorStore();
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [createdAt, setCreatedAt] = useState<Date | undefined>(undefined);

  const paymentsRef = useRef(watchedPayments);
  useEffect(() => {
    paymentsRef.current = watchedPayments;
  }, [watchedPayments]);

  useEffect(() => {
    if (orderData) {
      setCustomerId(orderData.customer?.id ?? undefined);
      setCreatedAt(new Date(orderData.createdAt));
    } else {
      setCustomerId(undefined);
      setCreatedAt(undefined);
    }
  }, [orderData]);

  useEffect(() => {
    if (!isEditMode) return;

    // We only care about confirmed (completed) amounts for calculation
    const confirmedTotal = paymentsRef.current
      .filter((p) => p.status === "completed")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const remainingToAllocate = calculatedPayable - confirmedTotal;

    // Find unconfirmed (pending) payments
    const unconfirmed = paymentsRef.current.filter(
      (p) => p.status !== "completed",
    );

    if (remainingToAllocate > 0) {
      if (unconfirmed.length > 0) {
        // Split the remaining balance among pending rows
        const perPaymentAmount = remainingToAllocate / unconfirmed.length;

        paymentsRef.current.forEach((p, idx) => {
          if (p.status !== "completed") {
            form.setValue(
              `payments.${idx}.amount`,
              Number(perPaymentAmount.toFixed(2)),
              {
                shouldDirty: true,
              },
            );
          }
        });
      } else {
        // No pending rows exist? Add a new one automatically
        appendPayment({
          amount: remainingToAllocate,
          paymentMethodId: 1, // Default or Cash
          status: "pending",
          referenceId: "",
        } as any);
      }
    } else if (remainingToAllocate < 0 && unconfirmed.length > 0) {
      // If overpaid and we have pending rows, reduce them to 0
      paymentsRef.current.forEach((p, idx) => {
        if (p.status !== "completed") {
          form.setValue(`payments.${idx}.amount`, 0);
        }
      });
    }

    // TRIGGER ONLY on price/mode change, NOT on payment change
  }, [calculatedPayable, isEditMode, appendPayment, form]);

  // Mutations (Logic kept same as your snippet)
  const updateMutation = useMutation({
    mutationFn: (values: any) => {
      // Logic to calculate DTO requirements (created, updated, removed)
      const originalItems = orderData?.items || [];

      const finalizedPayments = [...values.payments];
      const totalInput = finalizedPayments.reduce(
        (s, p) => s + (Number(p.amount) || 0),
        0,
      );
      const changeDue = totalInput - calculatedPayable;
      if (changeDue > 0) {
        // Find the payment method that is 'Cash' (showValue: true)
        // Note: You need to ensure showValue is part of your form values or look it up
        const cashIndex = finalizedPayments.findIndex(
          (p) => p.showValue === true,
        );

        if (cashIndex !== -1) {
          const currentCash = finalizedPayments[cashIndex].amount || 0;
          finalizedPayments[cashIndex] = {
            ...finalizedPayments[cashIndex],
            amount: Math.max(0, currentCash - changeDue),
          };
        }
      }

      const payload = {
        carGateId: values.carGateId,
        remark: values.remark,
        totalAdditionalDiscountAmount: values.totalAdditionalDiscountAmount,
        customerId: customerId,
        createdAt: createdAt?.toLocaleDateString("en-ca"),

        // Items that exist in original but not in current fields
        removedItems: originalItems
          .filter(
            (orig) => !values.items.find((curr: any) => curr.id === orig.id),
          )
          .map((i) => i.id),

        // Items with an ID that exist in both (check for changes)
        updatedItems: values.items
          .filter((curr: any) => curr.id)
          .map((curr: any) => ({
            productId: curr.productId,
            orderItemId: curr.id,
            quantity: Number(curr.quantity),
            subQuantity: Number(curr.subQuantity),
            unitPrice: Number(curr.unitPrice),
            discountAmount: Number(curr.discountAmount),
          })),

        // Items with no ID are new
        createdItems: values.items
          .filter((curr: any) => !curr.id)
          .map((curr: any) => ({
            productId: curr.productId,
            quantity: Number(curr.quantity),
            subQuantity: Number(curr.subQuantity),
            unitPrice: Number(curr.unitPrice),
          })),

        otherCharges: values.otherCharges.map((oc: any) => ({
          otherChargeId: oc.otherChargeId,
          amount: Number(oc.amount),
        })),
        payment: finalizedPayments.filter((p) => p.amount > 0),
        orderStatus: values.orderStatus,
      };
      return updateOrder({ id: orderData!.id, data: payload as any });
    },
    onSuccess: (payload) => {
      if (payload.error) {
        setError(payload.error as any);
      } else {
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ["order-details", slug] });
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelPOSOrder({
        id: orderData!.id,
      }),
    onSuccess: (payload) => {
      if (payload.error) {
        setError(payload.error as any);
      } else {
        queryClient.invalidateQueries({ queryKey: ["order-details", slug] });
        setIsEditMode(false);
      }
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  const isPending = updateMutation.isPending || cancelMutation.isPending;
  const status = getStatusConfig(orderData?.status ?? "");

  const printRef = useRef<HTMLDivElement>(null);
  const printRefV2 = useRef<HTMLDivElement>(null);
  const [defaultVersion, setDefaultVersion] = useState(
    localStorage.getItem("printDefault"),
  );
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const handlePrintV1 = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Order - " + orderData?.id,
  });

  const handlePrintV2 = useReactToPrint({
    contentRef: printRefV2,
    documentTitle: "Order - " + orderData?.id,
  });

  const handlePrint = () => {
    if (defaultVersion === "v1") {
      handlePrintV1();
    } else if (defaultVersion === "v2") {
      handlePrintV2();
    } else {
      // No default set, ask the user
      setShowPrintModal(true);
    }
  };

  const selectVersion = (version: string) => {
    if (saveAsDefault) {
      localStorage.setItem("printDefault", version);
      setDefaultVersion(version);
    }

    // Execute the print
    if (version === "v1") {
      handlePrintV1();
    } else {
      handlePrintV2();
    }
    setShowPrintModal(false);
  };

  const clearPreference = () => {
    localStorage.removeItem("printDefault");
    setDefaultVersion(null);
  };

  const itemCount = watchedItems.length;
  const orderPrefix = isCustomer ? "/orders" : "/purchase-orders";

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 pb-20 lg:pb-10 overflow-y-auto">
        {/* --- Header --- */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={orderPrefix}
                className="group p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </Link>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Order #{orderData?.id}
                  </h1>
                  <Badge
                    className={cn(
                      "text-[10px] px-2 py-0.5 h-5 border-none shadow-none font-bold uppercase tracking-wider",
                      status.color,
                    )}
                  >
                    {orderData?.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                  {orderData?.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(orderData.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {orderData?.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(orderData.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <>
                  <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrint}
                      className="h-7 px-3 text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                    >
                      <Printer size={14} className="mr-1.5" /> Print
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-md text-slate-500 hover:bg-white hover:shadow-sm"
                        >
                          <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handlePrint}>
                          <Printer className="mr-2 h-4 w-4" />
                          <span>Print Standard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePrintV2}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Print Detailed</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigate(`${orderPrefix}/${slug}/print`);
                          }}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>Cloud Print</span>
                        </DropdownMenuItem>
                        {defaultVersion && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={clearPreference}
                              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Reset Preferences</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    size="icon"
                    variant={"ghost"}
                    className="flex sm:hidden"
                    onClick={() => {
                      navigate(`${orderPrefix}/${slug}/print`);
                    }}
                  >
                    <Printer />
                  </Button>

                  {((orderData?.status !== "Success" &&
                    user?.isAdmin === false) ||
                    user?.isAdmin === true) && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        className="hidden sm:flex h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-full text-xs font-bold uppercase tracking-wide"
                      >
                        Edit Order
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => setIsEditMode(true)}
                        className="flex sm:hidden h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-full text-xs font-bold uppercase tracking-wide"
                      >
                        <Edit />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditMode(false);
                      form.reset({
                        carGateId: orderData?.carGate?.id,
                        remark: orderData?.remark || "",
                        totalAdditionalDiscountAmount:
                          orderData?.totals?.additionalDiscount || 0,
                        items: orderData?.items || [],
                        payments: orderData?.payments
                          ? orderData.payments.map((item) => {
                              return {
                                referenceId: item.referenceId,
                                amount: item.amount,
                                paymentMethodId: item.typeId,
                                status: item.status,
                                paymentId: item.id,
                              };
                            })
                          : [],
                        otherCharges: orderData?.otherCharges
                          ? orderData.otherCharges
                          : [],
                        orderStatus: orderData?.status,
                      });
                    }}
                    className="h-9 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCancel}
                    disabled={isPending}
                    variant="outline"
                    className="h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 font-bold rounded-full text-xs uppercase tracking-wide"
                  >
                    {cancelMutation.isPending ? (
                      "Cancelling..."
                    ) : (
                      <>Cancel Order</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate(form.getValues())}
                    disabled={isPending}
                    className="h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-full text-xs font-bold uppercase tracking-wide"
                  >
                    {isPending ? (
                      <Clock size={16} className="animate-spin mr-2" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Left Column: Items & Payments --- */}
          <div className="lg:col-span-8 space-y-5">
            {/* Order Contents */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100 py-0">
              <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-indigo-500" />
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Order Items
                  </h2>
                </div>
                {isEditMode && (
                  <Drawer
                    open={isProductDrawerOpen}
                    onOpenChange={setIsProductDrawerOpen}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors ml-auto"
                      >
                        <Plus size={14} className="mr-1.5" /> Add Product
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[90vh] min-h-[90vh]">
                      <DrawerHeader className="flex flex-row items-center justify-between shrink-0">
                        <div>
                          <DrawerTitle>Select Products</DrawerTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="bg-indigo-50 text-indigo-600 border-none"
                            >
                              {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
                              in list
                            </Badge>
                          </div>
                        </div>
                        {/* Add a manual Close/Done button */}
                        <Button
                          variant="default"
                          className="rounded-full bg-indigo-600 px-6"
                          onClick={() => setIsProductDrawerOpen(false)}
                        >
                          Done
                        </Button>
                      </DrawerHeader>
                      <div className="flex-1 min-h-0 w-full overflow-hidden">
                        <POSProductSection
                          isCustomer={isCustomer}
                          addToCart={(product, multiplier) => {
                            const existingIndex = watchedItems.findIndex(
                              (item) => item.productId === product.id,
                            );

                            if (existingIndex !== -1) {
                              // Update quantity of existing row
                              const currentQty = form.getValues(
                                `items.${existingIndex}.quantity`,
                              );
                              form.setValue(
                                `items.${existingIndex}.quantity`,
                                currentQty + 1 * multiplier,
                              );
                              form.setValue(
                                `items.${existingIndex}.subQuantity`,
                                1,
                              );
                              toast.success(
                                `Updated ${product.name} quantity ${currentQty + 1 * multiplier}`,
                                {
                                  position: "top-center",
                                },
                              );
                            } else {
                              // Add new row
                              append({
                                productId: product.id,
                                productName: product.name,
                                productSKU: product.sku,
                                productImage: product.imagePath,
                                quantity: 1 * multiplier,
                                subQuantity: 1,
                                unitPrice: product.price,
                                discountAmount: 0,
                              } as any);
                              toast.success("Added to order", {
                                position: "top-center",
                              });
                            }
                          }}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>

              <div className="overflow-x-auto min-h-[150px]">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 text-left w-[40%]">Product</th>
                      <th className="px-2 py-3 text-center w-[12%]">Bag</th>
                      <th className="px-2 py-3 text-center w-[12%]">Qty</th>
                      <th className="px-2 py-3 text-right w-[15%]">Price</th>
                      {/* <th className="px-2 py-3 text-right w-[15%]">Disc.</th> */}
                      <th className="px-5 py-3 text-right w-[18%]">Total</th>
                      {isEditMode && <th className="px-2 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fields.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-slate-400 text-sm italic bg-slate-50/30"
                        >
                          No items in this order.
                        </td>
                      </tr>
                    )}
                    {fields.map((field, index) => (
                      <tr
                        key={field.id}
                        className="group hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex flex-row items-center gap-3">
                            <div className="relative overflow-hidden rounded-lg w-10 h-10 border border-slate-100 bg-white shrink-0">
                              <img
                                src={field.productImage}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-700 truncate">
                                {field.productName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {field.productSKU}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            className="h-8 text-center font-bold bg-transparent border-slate-100 focus:bg-white focus:border-indigo-200 text-xs px-1"
                            value={watchedItems[index]?.subQuantity || 0}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.subQuantity`,
                                e.currentTarget.valueAsNumber,
                              );
                            }}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            className="h-8 text-center font-bold bg-transparent border-slate-100 focus:bg-white focus:border-indigo-200 text-xs px-1"
                            value={watchedItems[index]?.quantity || 0}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.quantity`,
                                e.currentTarget.valueAsNumber,
                              );
                            }}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            defaultValue={Math.round(field.unitPrice)}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.unitPrice`,
                                e.currentTarget.valueAsNumber,
                              );
                            }}
                            className="h-8 text-right font-medium bg-transparent border-transparent hover:border-slate-100 focus:bg-white focus:border-indigo-200 text-xs px-1"
                          />
                        </td>
                        {/* <td className="px-2 py-3">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            defaultValue={field.discountAmount}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.discountAmount`,
                                e.currentTarget.valueAsNumber,
                              );
                            }}
                            className="h-8 text-right font-medium bg-transparent border-transparent hover:border-slate-100 focus:bg-white focus:border-indigo-200 text-xs px-1 text-rose-500"
                          />
                        </td> */}
                        <td className="px-5 py-3 text-right font-bold text-slate-900 text-sm">
                          {(
                            form.watch(`items.${index}.quantity`) *
                              form.watch(`items.${index}.subQuantity`) *
                              form.watch(`items.${index}.unitPrice`) -
                            form.watch(`items.${index}.discountAmount`)
                          ).toLocaleString()}
                        </td>
                        {isEditMode && (
                          <td className="px-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-7 w-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={field.productImage}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-slate-800 truncate">
                                {field.productName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {field.productSKU}
                              </p>
                            </div>
                            {isEditMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-6 w-6 p-0 text-slate-300 hover:text-rose-500"
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border rounded-md">
                              <Input
                                type="number"
                                disabled={!isEditMode}
                                className="h-7 w-12 text-center border-none text-xs font-bold p-0"
                                value={watchedItems[index]?.quantity || 0}
                                onChange={(e) =>
                                  form.setValue(
                                    `items.${index}.quantity`,
                                    e.currentTarget.valueAsNumber,
                                  )
                                }
                              />
                            </div>
                            <div className="text-xs text-slate-400">x</div>
                            <div className="font-bold text-sm">
                              {(
                                watchedItems[index]?.unitPrice || 0
                              ).toLocaleString()}
                            </div>
                            <div className="flex-1 text-right font-bold text-indigo-600">
                              {(
                                form.watch(`items.${index}.quantity`) *
                                  form.watch(`items.${index}.unitPrice`) -
                                form.watch(`items.${index}.discountAmount`)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Other Charges */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
              <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-amber-500" />
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Other Charges
                  </h2>
                </div>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors ml-auto"
                    onClick={() =>
                      appendOtherCharge({
                        amount: 0,
                        otherChargeId: 0,
                        name: "",
                      } as any)
                    }
                  >
                    <Plus size={14} className="mr-1.5" /> Add Charge
                  </Button>
                )}
              </div>
              <div className="p-0">
                {otherChargesField.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-[10px] italic">
                    No additional charges.
                  </div>
                )}
                {otherChargesField.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1">
                      <OtherChargeDropdown
                        disabled={!isEditMode}
                        value={form.watch(
                          `otherCharges.${index}.otherChargeId` as any,
                        )}
                        setValue={(value) => {
                          form.setValue(
                            `otherCharges.${index}.otherChargeId` as any,
                            value,
                          );
                        }}
                      />
                    </div>
                    <div className="w-32 relative">
                      <Input
                        type="number"
                        disabled={!isEditMode}
                        {...form.register(`otherCharges.${index}.amount`)}
                        className="h-8 text-right font-bold pr-7 text-xs bg-white"
                        onWheelCapture={(e) => e.currentTarget.blur()}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                        K
                      </span>
                    </div>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOtherCharge(index)}
                        className="h-8 w-8 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Transaction Card */}
            {/* Payment Records */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
              <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-500" />
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Payments
                  </h2>
                </div>
                {isEditMode && remainingAmount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors ml-auto"
                    onClick={() => {
                      if (remainingAmount > 0) {
                        appendPayment({
                          amount: remainingAmount,
                          paymentMethodId: 1,
                          status: "pending",
                        } as any);
                      }
                    }}
                  >
                    <Plus size={14} className="mr-1.5" /> Add Payment
                  </Button>
                )}
              </div>

              <div className="p-0 divide-y divide-slate-50">
                {paymentFields.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-[10px] italic bg-slate-50/30">
                    No payments recorded yet.
                  </div>
                )}

                {paymentFields.map((field, index) => {
                  const isCompleted =
                    form.watch(`payments.${index}.status`) === "completed";

                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "flex flex-col md:flex-row md:items-center gap-3 p-4 transition-colors",
                        isCompleted ? "bg-emerald-50/10" : "bg-white",
                      )}
                    >
                      {/* Status Icon */}
                      <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-500"
                          />
                        ) : (
                          <Clock size={16} className="text-amber-500" />
                        )}
                      </div>

                      {/* Method & Ref */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">
                            Method
                          </label>
                          <PaymentTypeDropdown
                            disabled={!isEditMode || isCompleted}
                            value={form.watch(
                              `payments.${index}.paymentMethodId` as any,
                            )}
                            setValue={(value) =>
                              form.setValue(
                                `payments.${index}.paymentMethodId` as any,
                                value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">
                            Reference
                          </label>
                          <Input
                            disabled={!isEditMode || isCompleted}
                            {...form.register(`payments.${index}.referenceId`)}
                            placeholder="Ref ID"
                            className="h-9 bg-white border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="w-full md:w-32">
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">
                          Amount
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            disabled={!isEditMode || isCompleted}
                            {...form.register(`payments.${index}.amount`)}
                            className={cn(
                              "h-9 text-right font-bold pr-7 text-xs rounded-lg",
                              isCompleted
                                ? "text-emerald-600 bg-emerald-50/50 border-emerald-100"
                                : "text-slate-900",
                            )}
                            onWheelCapture={(e) => e.currentTarget.blur()}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                            K
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {isEditMode && (
                        <div className="flex items-end justify-end gap-1 pt-4 md:pt-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-lg transition-colors",
                              isCompleted
                                ? "text-amber-500 hover:bg-amber-50"
                                : "text-emerald-500 hover:bg-emerald-50",
                            )}
                            onClick={() => {
                              const nextStatus = isCompleted
                                ? "pending"
                                : "completed";
                              form.setValue(
                                `payments.${index}.status`,
                                nextStatus,
                              );
                            }}
                            title={
                              isCompleted
                                ? "Mark as Pending"
                                : "Mark as Completed"
                            }
                          >
                            {isCompleted ? (
                              <X size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </Button>

                          {!isCompleted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePayment(index)}
                              className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* --- Right Column: Summary & Sidebar --- */}
          <div className="lg:col-span-4 space-y-5">
            {/* Customer & Logistics - Combined Card */}
            <Card className="border-none shadow-sm rounded-2xl p-0 bg-white ring-1 ring-slate-100 overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 ring-1 ring-slate-100/50">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Customer
                    </p>
                    {isEditMode ? (
                      <CustomerDropdown
                        isCustomer={isCustomer}
                        setValue={(value) => {
                          setCustomerId(value);
                        }}
                        value={customerId}
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-800">
                        {orderData?.customer?.name || "Walk-in Customer"}{" "}
                        {orderData?.customer?.city
                          ? `(${orderData.customer.city})`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-50" />

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 ring-1 ring-slate-100/50">
                    <Truck size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Logistics
                    </p>
                    {isEditMode ? (
                      <div className="h-8">
                        <Select
                          onValueChange={(v) =>
                            form.setValue("carGateId", parseInt(v))
                          }
                          defaultValue={orderData?.carGate?.id?.toString()}
                        >
                          <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-200">
                            <SelectValue placeholder="Select Gate" />
                          </SelectTrigger>
                          <SelectContent>
                            {CAR_GATES?.data.map((gate) => (
                              <SelectItem
                                key={gate.id}
                                value={gate.id.toString()}
                                className="text-xs"
                              >
                                {gate.gateName}
                              </SelectItem>
                            ))}
                            <Button
                              className="w-full border-t text-xs "
                              variant={"ghost"}
                              type="button"
                              onClick={() => {
                                openPanel({
                                  title: "Create New CarGate",
                                  content: (
                                    <CarGateForm
                                      initialData={null}
                                      onSubmitComplete={() => refetchCarGates()}
                                    />
                                  ),
                                });
                              }}
                            >
                              Add car gate
                            </Button>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {orderData?.carGate?.name || "Standard Shipping"}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="bg-slate-50" />

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 ring-1 ring-slate-100/50">
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Order Status
                    </p>
                    {isEditMode ? (
                      <div className="h-8">
                        <Select
                          value={form.watch("orderStatus") as string}
                          onValueChange={(v) => form.setValue("orderStatus", v)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-200">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(OrderStatus)
                              .filter((item) => item !== OrderStatus.Cancelled)
                              .map((orderStatus) => (
                                <SelectItem
                                  key={orderStatus}
                                  value={orderStatus}
                                  className="text-xs"
                                >
                                  {orderStatus}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-bold text-slate-700 bg-slate-50 border-slate-200"
                      >
                        {orderData?.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 ring-1 ring-slate-100/50">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Order Date
                    </p>
                    {isEditMode ? (
                      <div className="h-8">
                        <DatePicker
                          value={createdAt}
                          setValue={(value) => {
                            setCreatedAt(value);
                          }}
                        />
                      </div>
                    ) : orderData?.createdAt ? (
                      <Badge
                        variant="outline"
                        className="font-bold text-slate-700 bg-slate-50 border-slate-200"
                      >
                        {new Date(orderData?.createdAt).toLocaleDateString(
                          "en-ca",
                          { year: "numeric", month: "short", day: "2-digit" },
                        )}
                      </Badge>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 ring-1 ring-slate-100/50">
                    <Monitor size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Created By
                    </p>
                    <Badge
                      variant="outline"
                      className="font-bold text-slate-700 bg-slate-50 border-slate-200"
                    >
                      {orderData?.createdBy}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing Summary */}
            <Card className="border-none shadow-xl shadow-indigo-100 rounded-[1.5rem] bg-slate-900 text-white p-6 relative overflow-hidden group">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-600/30 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="p-1.5 bg-white/5 rounded-lg backdrop-blur-sm">
                    <Receipt size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Total Payable
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white shadow-sm">
                    {calculatedPayable.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-500">Ks</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-200">
                      {watchedItems
                        .reduce(
                          (acc, curr) =>
                            acc +
                            curr.quantity * curr.subQuantity * curr.unitPrice,
                          0,
                        )
                        .toLocaleString()}{" "}
                      Ks
                    </span>
                  </div>

                  {isEditMode ? (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] font-bold uppercase text-indigo-300 tracking-wider">
                        Additional Discount
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...form.register("totalAdditionalDiscountAmount")}
                          className="bg-white/5 border-white/10 h-8 font-bold text-xs focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 rounded-lg pr-8 text-white placeholder:text-slate-600"
                          onWheelCapture={(e) => e.currentTarget.blur()}
                          placeholder="0"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold">
                          K
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs font-medium text-rose-400">
                      <span>Discount</span>
                      <span className="font-bold">
                        - {Number(watchedDiscount).toLocaleString()} Ks
                      </span>
                    </div>
                  )}
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Remaining
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2.5 py-0.5 font-bold border rounded-lg",
                        calculatedPayable - totalPaid <= 0
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                          : "border-rose-500/30 text-rose-400 bg-rose-500/10",
                      )}
                    >
                      {(calculatedPayable - totalPaid).toLocaleString()} Ks
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Internal Notes */}
            <Card className="border-none shadow-sm rounded-2xl p-5 bg-white ring-1 ring-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Internal Remarks
                </h3>
              </div>
              <Textarea
                disabled={!isEditMode}
                {...form.register("remark")}
                className="resize-none text-xs border-slate-100 min-h-[80px] bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded-xl"
                placeholder="Add notes about this order..."
              />
            </Card>
          </div>
        </div>

        {/* --- Mobile Floating Footer Actions --- */}
        {isEditMode && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t lg:hidden flex gap-2 z-50">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditMode(false)}
            >
              Discard
            </Button>
            <Button
              className="flex-1 bg-indigo-600 shadow-lg shadow-indigo-200"
              onClick={() => updateMutation.mutate(form.getValues())}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
      {/* Print Components - Rendered off-screen for code-driven capture */}
      <div
        className="fixed overflow-hidden opacity-0 pointer-events-none -z-50"
        style={{ left: "-9999px", top: "0" }}
      >
        <div ref={printRef}>
          <InvoicePrint
            orderData={orderData}
            watchedItems={watchedItems}
            calculatedPayable={calculatedPayable}
          />
        </div>
        <div ref={printRefV2}>
          <InvoicePrintV2
            warehouseAddress={orderData?.warehouse as any}
            paymentData={orderData?.payments as any}
            orderData={orderData}
            watchedItems={watchedItems}
            calculatedPayable={calculatedPayable}
            carGate={orderData?.carGate?.name}
          />
        </div>
      </div>
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Print Options</DialogTitle>
            <DialogDescription>
              Choose which layout version you would like to print.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => selectVersion("v1")}
                className="justify-start h-12"
              >
                <span className="font-bold mr-2">V1:</span> Standard Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => selectVersion("v2")}
                className="justify-start h-12"
              >
                <span className="font-bold mr-2">V2:</span> Detailed Summary
              </Button>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="default"
                checked={saveAsDefault}
                onCheckedChange={(value) => {
                  setSaveAsDefault(value);
                }}
              />
              <Label
                htmlFor="default"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Remember my choice for next time
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPrintModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
