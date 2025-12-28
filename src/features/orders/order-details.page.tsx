/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  Plus,
  Printer,
  Save,
  Trash2,
  Truck,
  User,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

import PaymentTypeDropdown from "@/components/dropdown/payment-type.dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { getCarGates } from "../car-gate/car-gate.action";
import { cancelPOSOrder, confirmPOSOrder } from "../pos/pos.action";
import { getOrderDetails, updateOrder } from "./orders.action";
import { getStatusConfig } from "./orders.page";

import { PYIDAUNGSU_BASE64 } from "@/lib/textHelper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", slug],
    queryFn: () => getOrderDetails({ slug: slug ?? "" }),
  });

  const orderData = order?.response?.data;

  // 1. Initialize Form
  const form = useForm({
    values: {
      carGateId: orderData?.carGate?.id,
      remark: orderData?.remark || "",
      totalAdditionalDiscountAmount: orderData?.totals?.additionalDiscount || 0,
      items:
        orderData?.items.map((item) => ({
          id: item.id, // The OrderItem ID
          productId: item.productId,
          productSKU: item.productSKU,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
        })) || [],
      payments:
        orderData?.payments.map((p) => ({
          paymentId: p.id,
          amount: p.amount,
          referenceId: p.referenceId,
          paymentMethodId: p.typeId || -1, // Default or existing
        })) || [],
    },
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: CAR_GATES } = useQuery({
    queryKey: ["car-gate-all"],
    queryFn: () =>
      getCarGates({ page: "0", size: "0", s: "", q: "" }).then(
        (r) => r.response
      ),
  });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("totalAdditionalDiscountAmount");

  const watchedPayments = form.watch("payments");
  const totalPaid = useMemo(() => {
    return watchedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  }, [watchedPayments]);

  const calculatedPayable = useMemo(() => {
    const subtotal = watchedItems.reduce((acc, curr) => {
      const qty = Number(curr.quantity) || 0;
      const price = Number(curr.unitPrice) || 0;
      const disc = Number(curr.discountAmount) || 0;
      return acc + qty * (price - disc);
    }, 0);

    const otherCharges = orderData?.totals?.otherCharges || 0;
    const globalDisc = Number(watchedDiscount) || 0;

    return subtotal + otherCharges - globalDisc;
  }, [watchedItems, watchedDiscount, orderData]);

  // 2. Mutation Logic
  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      updateOrder({
        id: orderData!.id,
        data: payload,
      }),
    onSuccess: () => {
      setIsEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["order-details", slug] });
    },
  });

  const handleSave = form.handleSubmit((values) => {
    // Logic to calculate DTO requirements (created, updated, removed)
    const originalItems = orderData?.items || [];

    const payload = {
      carGateId: values.carGateId,
      remark: values.remark,
      totalAdditionalDiscountAmount: values.totalAdditionalDiscountAmount,

      // Items that exist in original but not in current fields
      removedItems: originalItems
        .filter((orig) => !values.items.find((curr) => curr.id === orig.id))
        .map((i) => ({ productId: i.productId })),

      // Items with an ID that exist in both (check for changes)
      updatedItems: values.items
        .filter((curr) => curr.id)
        .map((curr) => ({
          orderItemId: curr.id,
          quantity: Number(curr.quantity),
          unitPrice: Number(curr.unitPrice),
          discountAmount: Number(curr.discountAmount),
        })),

      // Items with no ID are new
      createdItems: values.items
        .filter((curr) => !curr.id)
        .map((curr) => ({
          productId: curr.productId,
          quantity: Number(curr.quantity),
          unitPrice: Number(curr.unitPrice),
        })),

      otherCharges: orderData?.otherCharges, // Keeping current charges
    };

    updateMutation.mutate(payload);
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: any) =>
      confirmPOSOrder({
        id: orderData!.id,
        data: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-details", slug] });
      setIsEditMode(false);
      // Add a success toast here if you have one
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelPOSOrder({
        id: orderData!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-details", slug] });
      setIsEditMode(false);
      // Add a success toast here if you have one
    },
  });

  const handleConfirm = form.handleSubmit((values) => {
    const payload = {
      payment: values.payments.map((p) => ({
        paymentId: p.paymentId,
        amount: Number(p.amount),
        referenceId: p.referenceId,
        paymentMethodId: p.paymentMethodId,
      })),
    };
    confirmMutation.mutate(payload);
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

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

  const isPending =
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  if (isLoading)
    return <div className="p-10 text-center font-bold">Loading...</div>;
  const status = getStatusConfig(orderData?.status ?? "");

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Actions */}
      <div className="sticky top-0 z-30 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ChevronLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-black flex flex-row items-center gap-3">
            Order #{orderData?.id}
            <Badge
              className={`rounded-md px-2 py-0.5 border shadow-none font-bold text-[9px] uppercase mx-auto flex items-center gap-1 w-fit ${status.color}`}
            >
              {status.icon} {orderData?.status}
            </Badge>
          </h1>
        </div>

        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditMode(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              {/* Save Button: Just updates Order details/items */}
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-slate-900 hover:bg-slate-800 font-bold gap-2 text-white"
              >
                {updateMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Details
                  </>
                )}
              </Button>

              {/* Process Button: Finalizes the order with payments */}
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
              >
                {confirmMutation.isPending ? (
                  "Confirming..."
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirmation
                  </>
                )}
              </Button>

              <Button
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
            </>
          ) : (
            orderData?.status !== "success" && (
              <Button
                onClick={() => setIsEditMode(true)}
                className="bg-slate-900 font-bold"
              >
                Edit & Pay
              </Button>
            )
          )}
          <Button onClick={handlePrint}>
            <Printer />
            Print
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Items Card */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white py-0">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-black uppercase text-slate-400">
                Order Contents
              </span>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-dashed"
                  onClick={() =>
                    append({
                      productId: 0,
                      productName: "New Product",
                      quantity: 1,
                      unitPrice: 0,
                      discountAmount: 0,
                    } as any)
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Code</th>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-center w-24">Qty</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    {isEditMode && <th className="px-6 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="text-sm">
                      <td className="px-6 py-4">
                        {isEditMode && !field.id ? (
                          <Input
                            placeholder="Search product..."
                            className="h-8 text-xs"
                          />
                        ) : (
                          <p className="font-bold text-slate-700">
                            {field.productSKU}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && !field.id ? (
                          <Input
                            placeholder="Search product..."
                            className="h-8 text-xs"
                          />
                        ) : (
                          <p className="font-bold text-slate-700">
                            {field.productName}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          disabled={!isEditMode}
                          {...form.register(`items.${index}.quantity` as const)}
                          className="h-8 text-center font-bold disabled:bg-transparent disabled:border-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          disabled={!isEditMode}
                          {...form.register(
                            `items.${index}.unitPrice` as const
                          )}
                          className="h-8 text-right font-bold disabled:bg-transparent disabled:border-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-black">
                        {(
                          form.watch(`items.${index}.quantity`) *
                          form.watch(`items.${index}.unitPrice`)
                        ).toLocaleString()}
                      </td>
                      {isEditMode && (
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-rose-500"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Remarks Section */}
          <Card className="rounded-3xl border-none shadow-sm p-6">
            <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
              Order Remark
            </span>
            <Textarea
              disabled={!isEditMode}
              {...form.register("remark")}
              placeholder="Add internal notes about this order..."
              className="rounded-2xl border-slate-100 disabled:opacity-100 disabled:bg-transparent"
            />
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white py-0">
            <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400">
                Transaction History
              </span>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendPayment({
                      amount: 0,
                      referenceId: "",
                      paymentMethodId: 1,
                    } as any)
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Payment
                </Button>
              )}
            </div>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left min-w-[200px]">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left">Reference</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    {isEditMode && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paymentFields.map((field, index) => (
                    <tr key={field.id} className="text-xs">
                      <td className="px-6 py-4">
                        <PaymentTypeDropdown
                          value={form.watch(
                            `payments.${index}.paymentMethodId`
                          )}
                          setValue={(value) => {
                            form.setValue(
                              `payments.${index}.paymentMethodId`,
                              value
                            );
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          disabled={!isEditMode}
                          {...form.register(`payments.${index}.referenceId`)}
                          className="h-8"
                          placeholder="Check/Transfer ID"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          disabled={!isEditMode}
                          {...form.register(`payments.${index}.amount`)}
                          className="h-8 text-right font-bold"
                        />
                      </td>
                      {isEditMode && (
                        <td className="px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePayment(index)}
                            className="text-rose-500"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Customer & Logistics */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Customer
                </p>
                <p className="text-sm font-bold">
                  {orderData?.customer?.name || "Walk-in"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Truck size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Car Gate
                </p>
                {isEditMode ? (
                  <Select
                    onValueChange={(v) =>
                      form.setValue("carGateId", parseInt(v))
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
                ) : (
                  <p className="text-sm font-bold">
                    {orderData?.carGate?.name || "No Gate Assigned"}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Pricing Sidebar */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-200 text-primary p-8 relative overflow-hidden">
            {/* Decorative Background Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Total Payable
                </span>
                <div className="text-4xl font-black text-primary mt-2">
                  {calculatedPayable.toLocaleString()}{" "}
                  <span className="text-sm">Ks</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Items Subtotal</span>
                  <span>
                    {watchedItems
                      .reduce(
                        (acc, curr) =>
                          acc + Number(curr.quantity) * Number(curr.unitPrice),
                        0
                      )
                      .toLocaleString()}{" "}
                    Ks
                  </span>
                </div>

                {isEditMode ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-primary">
                      Global Discount
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        {...form.register("totalAdditionalDiscountAmount")}
                        className="bg-white/5 border-white/10 h-10 font-black pr-10 focus:border-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-black">
                        KS
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-xs font-bold text-rose-400">
                    <span>Additional Discount</span>
                    <span>- {watchedDiscount?.toLocaleString() || 0} Ks</span>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Payment Status Summary */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">
                  Balance Due
                </span>
                <span
                  className={`font-black ${calculatedPayable - (orderData?.payments.reduce((s, p) => s + p.amount, 0) || 0) <= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {(calculatedPayable - totalPaid).toLocaleString()} Ks
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
