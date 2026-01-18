/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  ChevronLeft,
  Coins,
  CreditCard,
  Package,
  Plus,
  Printer,
  Receipt,
  Save,
  Trash2,
  Truck,
  User,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

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

import OtherChargeDropdown from "@/components/dropdown/other-charge.dropdown";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PYIDAUNGSU_BASE64 } from "@/lib/textHelper";
import { useErrorStore } from "@/store/error.store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import POSProductSection from "../pos/pos-product-section";
import { cancelPOSOrder } from "../pos/pos.action";
import { OrderStatus } from "./order.response";

export default function OrderDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

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

  const { data: CAR_GATES } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: () =>
      getCarGates({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });

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

  const watchedDiscount = useMemo(
    () => watchedItems.reduce((s, p) => s + (Number(p.discountAmount) || 0), 0),
    [watchedItems]
  );

  const totalPaid = useMemo(
    () =>
      watchedPayments
        .filter((p) => p.status === "completed")
        .reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [watchedPayments]
  );
  const totalPlannedPayments = useMemo(
    () => watchedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [watchedPayments]
  );

  const calculatedPayable = useMemo(() => {
    const subtotal = watchedItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.unitPrice,
      0
    );

    // Calculate total from other charges fields
    const otherChargesTotal = (watchedOtherCharges || []).reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0
    );

    return subtotal + otherChargesTotal - Number(watchedDiscount || 0);
  }, [watchedItems, watchedDiscount, watchedOtherCharges]);

  const remainingAmount = calculatedPayable - totalPlannedPayments;

  const { setError } = useErrorStore();
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  const paymentsRef = useRef(watchedPayments);
  useEffect(() => {
    paymentsRef.current = watchedPayments;
  }, [watchedPayments]);

  useEffect(() => {
    if (!isEditMode) return;

    // We only care about confirmed (completed) amounts for calculation
    const confirmedTotal = paymentsRef.current
      .filter((p) => p.status === "completed")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const remainingToAllocate = calculatedPayable - confirmedTotal;

    // Find unconfirmed (pending) payments
    const unconfirmed = paymentsRef.current.filter(
      (p) => p.status !== "completed"
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
              }
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
        0
      );
      const changeDue = totalInput - calculatedPayable;
      if (changeDue > 0) {
        // Find the payment method that is 'Cash' (showValue: true)
        // Note: You need to ensure showValue is part of your form values or look it up
        const cashIndex = finalizedPayments.findIndex(
          (p) => p.showValue === true
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

        // Items that exist in original but not in current fields
        removedItems: originalItems
          .filter(
            (orig) => !values.items.find((curr: any) => curr.id === orig.id)
          )
          .map((i) => i.id),

        // Items with an ID that exist in both (check for changes)
        updatedItems: values.items
          .filter((curr: any) => curr.id)
          .map((curr: any) => ({
            productId: curr.productId,
            orderItemId: curr.id,
            quantity: Number(curr.quantity),
            unitPrice: Number(curr.unitPrice),
            discountAmount: Number(curr.discountAmount),
          })),

        // Items with no ID are new
        createdItems: values.items
          .filter((curr: any) => !curr.id)
          .map((curr: any) => ({
            productId: curr.productId,
            quantity: Number(curr.quantity),
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
      // Add a success toast here if you have one
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  const isPending = updateMutation.isPending || cancelMutation.isPending;
  const status = getStatusConfig(orderData?.status ?? "");

  const handlePrint = () => {
    // Define custom size: [width, height] in mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [155, 185],
    });

    // Load Burmese Font
    doc.addFileToVFS("Pyidaungsu.ttf", PYIDAUNGSU_BASE64);
    doc.addFont("Pyidaungsu.ttf", "Pyidaungsu", "normal");
    doc.setFont("Pyidaungsu");

    // --- Header Section ---
    // doc.setFontSize(18);
    // doc.text("ဟိတ်တန်", 77.5, 15, { align: "center" }); // "Htate Tan" in Burmese

    // doc.setFontSize(9);
    // doc.text("ထီး၊ မိုးကာ အထွေထွေ ရောင်းဝယ်ရေးနှင့် ဖြန့်ချိရေး", 77.5, 22, {
    //   align: "center",
    // });

    // // Phone numbers and Address
    // doc.setFontSize(8);
    // doc.text("ဖုန်း - 09 50 92847, 09 2540 78179", 77.5, 28, {
    //   align: "center",
    // });
    // doc.text(
    //   "အမှတ် (၈၅/၉၃)၊ ဒုတိယထပ်၊ လမ်း ၃၀ (အောက်)၊ ပန်းဘဲတန်းမြို့နယ်၊ ရန်ကုန်မြို့။",
    //   77.5,
    //   33,
    //   { align: "center" }
    // );

    // doc.line(10, 36, 145, 36); // Horizontal line

    // --- Info Section ---
    doc.setFontSize(10);
    doc.text(`${orderData?.customer?.name ?? "Walk-In"}`, 12, 45);
    doc.text(
      `${new Date().toLocaleDateString("en-ca", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })}`,
      105,
      45
    );
    doc.text(`${orderData?.customer?.address ?? "N/A"}`, 12, 52);

    // --- Items Table ---
    const tableColumn = ["", "", "", ""];
    const tableRows = watchedItems.map((item) => [
      item.quantity,
      `${item.productSKU ? "[" + item.productSKU + "] " : ""}${item.productName}`,
      item.unitPrice.toLocaleString(),
      (item.quantity * item.unitPrice).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "Pyidaungsu",
        fontSize: 9,
        cellPadding: 2,
        lineColor: [0, 0, 0], // Black borders like the physical receipt
        lineWidth: 0,
      },
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // No.
        1: { cellWidth: "auto" }, // Particulars
        2: { cellWidth: 15, halign: "center" }, // Quantity
        3: { cellWidth: 25, halign: "right" }, // Unit Price
        4: { cellWidth: 25, halign: "right" }, // Amount
      },
      // Ensure table fills space but leaves room for total
      margin: { left: 10, right: 10 },
    });

    doc.setFontSize(10);
    // doc.text("စုစုပေါင်း (Total Amount):", 85, finalY + 5);
    doc.text(`${calculatedPayable.toLocaleString()} Ks`, 143, 180, {
      align: "right",
    });

    // doc.setFontSize(8);
    // doc.text("* ဝယ်ပြီးပစ္စည်း ပြန်မလဲပါ။", 12, finalY + 15);

    // doc.text("..........................", 120, finalY + 25, {
    //   align: "center",
    // });
    // doc.text("ငွေလက်ခံသူ", 120, finalY + 30, { align: "center" });

    const blobURL = doc.output("bloburl");
    window.open(blobURL, "_blank");
  };

  const itemCount = watchedItems.length;

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 pb-20 lg:pb-10 overflow-y-auto">
        {/* --- Sticky Header --- */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm lg:text-lg font-bold text-slate-900">
                    Order #{orderData?.id}
                  </h1>
                  <Badge
                    className={cn(
                      "text-[10px] px-2 py-0 border-none shadow-none",
                      status.color
                    )}
                  >
                    {orderData?.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Created on{" "}
                  {orderData?.createdAt
                    ? new Date(orderData?.createdAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="hidden sm:flex gap-2"
                  >
                    <Printer size={16} /> Print
                  </Button>
                  {orderData?.status !== "Success" && (
                    <Button
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                    >
                      Edit & Pay
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
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
                  >
                    Cancel
                  </Button>
                  <Button
                    size={"sm"}
                    onClick={handleCancel}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 font-bold gap-2"
                  >
                    {cancelMutation.isPending ? (
                      "Cancelling..."
                    ) : (
                      <>
                        <XIcon className="w-4 h-4" /> Cancel
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate(form.getValues())}
                    disabled={isPending}
                  >
                    <Save size={16} className="mr-2" /> Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Left Column: Items & Payments --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Order Contents */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white pt-3">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Order Contents
                  </h2>
                </div>
                {isEditMode && (
                  <Drawer
                    open={isProductDrawerOpen}
                    onOpenChange={setIsProductDrawerOpen}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-indigo-600 border-indigo-100"
                      >
                        <Plus size={14} className="mr-1" /> Add
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
                          addToCart={(product, multiplier) => {
                            const existingIndex = watchedItems.findIndex(
                              (item) => item.productId === product.id
                            );

                            if (existingIndex !== -1) {
                              // Update quantity of existing row
                              const currentQty = form.getValues(
                                `items.${existingIndex}.quantity`
                              );
                              form.setValue(
                                `items.${existingIndex}.quantity`,
                                currentQty + 1 * multiplier
                              );
                              toast.success(
                                `Updated ${product.name} quantity ${currentQty + 1 * multiplier}`,
                                {
                                  position: "top-center",
                                }
                              );
                            } else {
                              // Add new row
                              append({
                                productId: product.id,
                                productName: product.name,
                                productSKU: product.sku,
                                productImage: product.imagePath,
                                quantity: 1 * multiplier,
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

              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Product</th>
                      <th className="px-6 py-3 text-center w-24">Qty</th>
                      <th className="px-6 py-3 text-right">Price</th>
                      <th className="px-6 py-3 text-right">Discount</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      {isEditMode && <th className="px-4"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fields.map((field, index) => (
                      <tr
                        key={field.id}
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-row items-center gap-3">
                            <img
                              src={field.productImage}
                              className="w-14 h-14 max-w-14 max-h-14"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">
                                {field.productName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {field.productSKU}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            className="h-8 text-center font-bold bg-transparent border-slate-200 focus:bg-white"
                            value={watchedItems[index]?.quantity || 0}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.quantity`,
                                e.currentTarget.valueAsNumber
                              );
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            defaultValue={field.unitPrice}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.unitPrice`,
                                e.currentTarget.valueAsNumber
                              );
                            }}
                            className="h-8 text-right font-bold bg-transparent border-slate-200 focus:bg-white"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            defaultValue={field.discountAmount}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.discountAmount`,
                                e.currentTarget.valueAsNumber
                              );
                            }}
                            className="h-8 text-right font-bold bg-transparent border-slate-200 focus:bg-white"
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {(
                            form.watch(`items.${index}.quantity`) *
                              form.watch(`items.${index}.unitPrice`) -
                            form.watch(`items.${index}.discountAmount`)
                          ).toLocaleString()}
                        </td>
                        {isEditMode && (
                          <td className="px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800">
                            {field.productName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {field.productSKU}
                          </p>
                        </div>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-rose-500 h-8 w-8 p-0"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            Qty
                          </span>
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            className="h-9"
                            value={watchedItems[index]?.quantity || 0}
                            onChange={(e) => {
                              form.setValue(
                                `items.${index}.quantity`,
                                e.currentTarget.valueAsNumber
                              );
                            }}
                            onWheelCapture={(e) => e.currentTarget.blur()}
                          />
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            Unit Price
                          </span>
                          <Input
                            type="number"
                            disabled={!isEditMode}
                            {...form.register(`items.${index}.unitPrice`)}
                            className="h-9 text-right"
                            onWheelCapture={(e) => e.currentTarget.blur()}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Other Charge */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white pt-3">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Other Charges
                  </h2>
                </div>
                {isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-indigo-600 border-indigo-100"
                    onClick={() =>
                      appendOtherCharge({
                        amount: 0,
                        otherChargeId: 0,
                        name: "",
                      } as any)
                    }
                  >
                    <Plus size={14} className="mr-1" /> Add Charge
                  </Button>
                )}
              </div>
              <div className="p-0">
                {otherChargesField.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No additional charges added.
                  </div>
                )}
                {otherChargesField.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border-b last:border-0 items-end md:items-center animate-in fade-in"
                  >
                    <div className="w-full md:flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block md:hidden">
                        Charge Type
                      </label>
                      <OtherChargeDropdown
                        disabled={!isEditMode}
                        value={form.watch(
                          `otherCharges.${index}.otherChargeId` as any
                        )}
                        setValue={(value) => {
                          form.setValue(
                            `otherCharges.${index}.otherChargeId` as any,
                            value
                          );
                        }}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block md:hidden">
                        Amount
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          disabled={!isEditMode}
                          {...form.register(`otherCharges.${index}.amount`)}
                          className="h-9 text-right font-bold pr-8"
                          onWheelCapture={(e) => e.currentTarget.blur()}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          Ks
                        </span>
                      </div>
                    </div>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOtherCharge(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Transaction Card */}
            {/* Transaction Card */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="px-6 py-5 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Payment Records
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {calculatedPayable - totalPaid <= 0
                        ? "Order fully paid"
                        : `Remaining: ${(calculatedPayable - totalPaid).toLocaleString()} Ks`}
                    </p>
                  </div>
                </div>

                {isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={remainingAmount <= 0}
                    className={cn(
                      "rounded-full border-indigo-200 text-indigo-600",
                      remainingAmount <= 0 && "opacity-50 cursor-not-allowed"
                    )}
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
                    <Plus size={14} className="mr-1" /> Add Payment
                  </Button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {paymentFields.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400 italic">
                      No payments recorded yet.
                    </p>
                  </div>
                )}

                {paymentFields.map((field, index) => {
                  const isCompleted =
                    form.watch(`payments.${index}.status`) === "completed";

                  return (
                    <div
                      key={field.id}
                      className={cn(
                        "relative group rounded-[1.5rem] border-2 transition-all duration-200",
                        isCompleted
                          ? "bg-emerald-50/30 border-emerald-100"
                          : "bg-white border-slate-100 shadow-sm"
                      )}
                    >
                      {/* Status Indicator Tag */}
                      <div
                        className={cn(
                          "absolute -top-2.5 left-6 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          isCompleted
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-amber-400 text-white border-amber-400"
                        )}
                      >
                        {isCompleted ? "Captured" : "Pending"}
                      </div>

                      <div className="p-5 pt-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Payment Method Selector */}
                        <div className="w-full md:w-1/3">
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                            Method
                          </label>
                          <PaymentTypeDropdown
                            disabled={!isEditMode || isCompleted}
                            value={form.watch(
                              `payments.${index}.paymentMethodId` as any
                            )}
                            setValue={(value) =>
                              form.setValue(
                                `payments.${index}.paymentMethodId` as any,
                                value
                              )
                            }
                          />
                        </div>

                        {/* Reference & Amount Inputs */}
                        <div className="flex-1 w-full grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase block">
                              Reference ID
                            </label>
                            <Input
                              disabled={!isEditMode || isCompleted}
                              {...form.register(
                                `payments.${index}.referenceId`
                              )}
                              placeholder="Txn # / Ref ID"
                              className="h-10 bg-white/50 border-slate-200 rounded-xl text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase block">
                              Amount
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                disabled={!isEditMode || isCompleted}
                                {...form.register(`payments.${index}.amount`)}
                                className="h-10 text-right font-black bg-white/50 border-slate-200 rounded-xl pr-8 text-indigo-600"
                                onWheelCapture={(e) => e.currentTarget.blur()}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                Ks
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditMode && (
                          <div className="flex items-center gap-1 md:pt-5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-10 w-10 rounded-xl transition-colors",
                                isCompleted
                                  ? "text-rose-400 hover:bg-rose-50"
                                  : "text-emerald-500 hover:bg-emerald-50"
                              )}
                              onClick={() => {
                                const nextStatus = isCompleted
                                  ? "pending"
                                  : "completed";
                                form.setValue(
                                  `payments.${index}.status`,
                                  nextStatus
                                );
                              }}
                            >
                              {isCompleted ? (
                                <XIcon size={18} />
                              ) : (
                                <CheckCircle2Icon size={18} />
                              )}
                            </Button>

                            {!isCompleted && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePayment(index)}
                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* --- Right Column: Summary & Sidebar --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Customer & Logistics */}
            <Card className="border-none shadow-sm rounded-2xl p-5 space-y-5 bg-white">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Customer
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {orderData?.customer?.name || "Walk-in"}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-50" />

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Truck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Logistics / Gate
                  </p>
                  {isEditMode ? (
                    <Select
                      onValueChange={(v) =>
                        form.setValue("carGateId", parseInt(v))
                      }
                    >
                      <SelectTrigger className="mt-1 h-9 rounded-lg border-slate-200">
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
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {orderData?.carGate?.name || "Standard Shipping"}
                    </p>
                  )}
                </div>
              </div>
              <Separator className="bg-slate-50" />

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-slate-600">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Order Status
                  </p>
                  {isEditMode ? (
                    <Select
                      value={form.watch("orderStatus") as string}
                      onValueChange={(v) => form.setValue("orderStatus", v)}
                    >
                      <SelectTrigger className="mt-1 h-9 rounded-lg border-slate-200">
                        <SelectValue placeholder="Select Order Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(OrderStatus)
                          .filter((item) => item !== OrderStatus.Cancelled)
                          .map((orderStatus) => (
                            <SelectItem key={orderStatus} value={orderStatus}>
                              {orderStatus}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {orderData?.status}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Pricing Summary */}
            <Card className="border-none shadow-lg rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px]" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Receipt size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Grand Total
                  </span>
                </div>

                <div className="text-5xl font-black tracking-tighter">
                  {calculatedPayable.toLocaleString()}
                  <span className="text-xl ml-2 font-medium opacity-50">
                    Ks
                  </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Subtotal</span>
                    <span>
                      {watchedItems
                        .reduce(
                          (acc, curr) => acc + curr.quantity * curr.unitPrice,
                          0
                        )
                        .toLocaleString()}{" "}
                      Ks
                    </span>
                  </div>

                  {isEditMode ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-indigo-400">
                        Adjust Discount
                      </label>
                      <Input
                        type="number"
                        {...form.register("totalAdditionalDiscountAmount")}
                        className="bg-white/5 border-white/10 h-10 font-bold focus:ring-indigo-500"
                        onWheelCapture={(e) => e.currentTarget.blur()}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs font-medium text-rose-400">
                      <span>Discount</span>
                      <span>
                        - {Number(watchedDiscount).toLocaleString()} Ks
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Balance Due
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm px-3 py-1 font-black",
                        calculatedPayable - totalPaid <= 0
                          ? "border-emerald-500 text-emerald-400"
                          : "border-rose-500 text-rose-400"
                      )}
                    >
                      {(calculatedPayable - totalPaid).toLocaleString()} Ks
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Internal Notes */}
            <Card className="border-none shadow-sm rounded-2xl p-6 bg-white">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Internal Remarks
              </h3>
              <Textarea
                disabled={!isEditMode}
                {...form.register("remark")}
                className="resize-none text-xs border-slate-100 min-h-[100px] focus:ring-1 focus:ring-indigo-100"
                placeholder="No internal notes..."
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
    </>
  );
}
