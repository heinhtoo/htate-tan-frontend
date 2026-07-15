/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useMemo } from "react";
import headline from "./headline.png";
import type { OrderResponse, PaymentResponse } from "./order.response";

/**
 * Paginate by estimated name wrap lines.
 * Base row (1 name line + SKU) = 1 unit — calibrated so ~12 short items fill a page.
 * Extra name wraps cost 0.5 each (SKU height is shared, so a 2-line name is ~1.5× not 2×).
 * Wrapping prefers spaces (same as the browser) so long titles are not over-counted
 * as ceil(chars/N), which left huge empty space under only 4 items.
 */
const CHARS_PER_NAME_LINE = 20;
const MAX_LINE_UNITS_PER_PAGE = {
  a5: 12,
  a4: 22,
} as const;
const EXTRA_NAME_LINE_COST = 0.5;

function countNameLines(productName?: string) {
  const normalized = (productName ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return 1;

  let lines = 0;
  let remaining = normalized;

  while (remaining.length > 0) {
    lines += 1;
    const chars = Array.from(remaining);
    if (chars.length <= CHARS_PER_NAME_LINE) break;

    const windowStr = chars.slice(0, CHARS_PER_NAME_LINE).join("");
    const lastSpace = windowStr.lastIndexOf(" ");
    const take =
      lastSpace > 0
        ? Array.from(windowStr.slice(0, lastSpace)).length
        : CHARS_PER_NAME_LINE;

    remaining = chars.slice(take).join("").trimStart();
  }

  return Math.max(1, lines);
}

function getItemLineUnits(item: { productName?: string }) {
  const nameLines = countNameLines(item.productName);
  return 1 + (nameLines - 1) * EXTRA_NAME_LINE_COST;
}

function paginateItemsByLines<T extends { productName?: string }>(
  items: T[],
  maxLineUnits: number,
): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let usedLines = 0;

  for (const item of items) {
    const lines = getItemLineUnits(item);
    const wouldOverflow =
      current.length > 0 && usedLines + lines > maxLineUnits;

    if (wouldOverflow) {
      pages.push(current);
      current = [];
      usedLines = 0;
    }

    current.push(item);
    usedLines += lines;
  }

  if (current.length > 0 || pages.length === 0) {
    pages.push(current);
  }

  return pages;
}

export const InvoicePrintV2 = forwardRef<
  HTMLDivElement,
  {
    orderData?: OrderResponse;
    watchedItems: any[];
    calculatedPayable: number;
    paymentData: PaymentResponse[];
    warehouseAddress: any;
    carGate?: string;
    totalDebt: number;
    showDebt: boolean;
  }
>(
  (
    {
      orderData,
      watchedItems,
      calculatedPayable,
      paymentData,
      warehouseAddress,
      carGate,
      totalDebt,
      showDebt,
    },
    ref,
  ) => {
    const completedPayments =
      paymentData?.filter((p) => p.status === "completed") || [];
    const payTypeDisplay =
      completedPayments.length > 1
        ? "Mixed"
        : completedPayments[0]?.type || "Credit";

    const isA4 = false;
    const pages = useMemo(
      () =>
        paginateItemsByLines(
          watchedItems,
          isA4 ? MAX_LINE_UNITS_PER_PAGE.a4 : MAX_LINE_UNITS_PER_PAGE.a5,
        ),
      [watchedItems, isA4],
    );

    const debtAmount = showDebt ? totalDebt : 0;

    if (!orderData) {
      return <></>;
    }

    const paidAmount =
      orderData.payments.filter((item: any) => item.status === "completed")
        .length > 0
        ? orderData.payments
            .filter((item: any) => item.status === "completed")
            .map((item: any) => item.amount)
            .reduce((acc: any, item: any) => acc + item)
        : 0;

    return (
      <div ref={ref} className="flex flex-col items-center justify-center">
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className={`print-page bg-white text-[#0f172a] flex flex-col antialiased shrink-0 relative overflow-hidden ${
              isA4 ? "w-[210mm] h-[297mm]" : "w-[140mm] h-[200mm]"
            }`}
            style={{
              boxSizing: "border-box",
              // Product Sans has no Myanmar glyphs — pin the same fallback the browser
              // uses so html2canvas wraps text identically to the web preview.
              fontFamily:
                '"Product Sans", "Myanmar Text", "Noto Sans Myanmar", "Pyidaungsu", sans-serif',
            }}
          >
            {/* --- WATERMARK --- */}
            <div className="absolute left-0 bottom-0 top-32 right-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
              <span className="text-[120px] font-black px-8 py-2 rotate-[-35deg] uppercase">
                ထိပ်တန်း
              </span>
            </div>

            {/* --- COMPACT HEADER --- */}
            <div className="p-3 pt-4 text-center relative z-10 shrink-0">
              <div className="flex flex-row items-center justify-center mb-1">
                <img src={headline} className="h-[120px] object-contain" />
              </div>
              <div className="text-[10px] leading-tight pt-1 flex flex-col items-center gap-1.5">
                <p
                  className={
                    warehouseAddress?.id === 2
                      ? "font-bold underline"
                      : "opacity-70"
                  }
                >
                  ဆိုင်(၁) - ဆိုင်အမှတ် (၈၅၊ ၉၃)၊ ဒုတိယထပ်၊ (အတက်စက်လှေကားအနီး)၊
                  ရွှေမင်္ဂလာစျေး - 09 50 92847
                </p>
                <p
                  className={
                    warehouseAddress?.id === 1
                      ? "font-bold underline"
                      : "opacity-70"
                  }
                >
                  ဆိုင်(၂) - အမှတ် (၁၈၀)၊ စက်ရုံလမ်းမပေါ်၊ ၁၃၆လမ်းနှင့်
                  ၁၃၇လမ်းကြား၊​ မင်္ဂလာမွန်စျေးရှေ့ - 09 2540 78179
                </p>
              </div>
            </div>

            {/* --- COMPACT METADATA GRID --- */}
            <div className="px-4 grid grid-cols-2 text-[10px] border-y border-[#0f172a] bg-[#f8fafc] z-10 shrink-0">
              <div className="space-y-1 pr-2">
                <div className="flex flex-row items-start">
                  <span className="w-14 shrink-0 font-bold text-[#64748b] text-[8px]">
                    CUSTOMER
                  </span>
                  <span className="mx-1">:</span>
                  <span className="leading-tight">
                    {orderData?.customer?.name || "Walk-in Customer"}{" "}
                    {orderData?.customer?.city
                      ? `(${orderData.customer.city})`
                      : ""}{" "}
                    {orderData?.customer?.phoneNumber}
                  </span>
                </div>
                <div className="flex flex-row items-start">
                  <span className="w-14 shrink-0 font-bold text-[#64748b] text-[8px]">
                    VOUCHER NO
                  </span>
                  <span className="mx-1">:</span>
                  <span className="leading-tight">{orderData?.id}</span>
                </div>
              </div>
              <div className="space-y-1 border-l border-slate-300 pl-3">
                <div className="flex flex-row items-start">
                  <span className="w-14 shrink-0 font-bold text-[#64748b] text-[8px]">
                    DELIVERY
                  </span>
                  <span className="mx-1">:</span>
                  <span className="leading-tight">{carGate || "N/A"}</span>
                </div>
                <div className="flex flex-row items-start">
                  <span className="w-14 shrink-0 font-bold text-[#64748b] text-[8px]">
                    PAY TYPE
                  </span>
                  <span className="mx-1">:</span>
                  <span className="font-bold text-[#e11d48] uppercase">
                    {payTypeDisplay} (
                    {new Date(orderData.createdAt).toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                    )
                  </span>
                </div>
              </div>
            </div>

            {/* --- Table Section --- */}
            {/* No grow/mt-auto: footer sits directly under the table (no gap). */}
            <div className="px-2 pt-1 z-10 shrink-0">
              <table className="w-full text-[10px] border-b border-[#0f172a]">
                <thead>
                  <tr className="bg-[#f1f5f9]">
                    <th className="border border-[#0f172a] py-0.5 w-7 text-center font-bold">
                      No.
                    </th>
                    <th className="border border-[#0f172a] py-0.5 px-2 text-left font-bold">
                      Description
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-10 text-center font-bold">
                      Bag
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-12 text-center font-bold">
                      Qty
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-14 text-right pr-1 font-bold">
                      Price
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-20 text-right pr-1 font-bold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#94a3b8] text-sm"
                    >
                      <td className="border-x border-[#0f172a] text-center align-top py-0.5">
                        {item.orderIndex}
                      </td>
                      <td className="border-r border-[#0f172a] px-1.5 font-medium align-top py-0.5">
                        <div>
                          {/* Myanmar glyphs need >1.2 line-height or they collide when wrapping */}
                          <p className="leading-[20px] break-words">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-gray-600 leading-[13px]">
                            {item.productSKU && `[${item.productSKU}]`}
                          </p>
                        </div>
                      </td>
                      <td className="border-r border-[#0f172a] text-center font-bold align-top py-0.5">
                        {item.subQuantity}
                      </td>
                      <td className="border-r border-[#0f172a] text-center font-bold align-top py-0.5">
                        {item.quantity}
                      </td>
                      <td className="border-r border-[#0f172a] text-right pr-1 align-top py-0.5">
                        {parseFloat(item.unitPrice + "").toLocaleString()}
                      </td>
                      <td className="border-r border-[#0f172a] text-right pr-1 font-bold align-top py-0.5">
                        {(
                          item.quantity *
                          item.subQuantity *
                          item.unitPrice
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative px-4 py-2 z-20 shrink-0 bg-white">
              <div className="flex justify-between items-start">
                <div className="grow space-y-0.5 text-[8px] text-[#334155] font-medium leading-tight italic">
                  <p>• တရုတ် China ထီးပစ္စည်းများ အနာ လုံးဝ မလဲပေးပါ။</p>
                  <p>
                    • ကုမ္ပဏီထီးအနာပစ္စည်းများကို ဝယ်ပြီး ၇ရက်ထက် ကျော်လွန်လျှင်
                    မလဲပေးပါ။
                  </p>
                  <p>
                    • အနာပစ္စည်းများအား လဲမည်ဆိုပါက ဘောက်ချာယူလာပါရန်၊
                    ဘောက်ချာမပါလျှင် မလဲပေးပါ။
                  </p>
                  <p className="text-xs mt-3">Remark: {orderData?.remark}</p>
                </div>

                <div className="w-48 text-right flex flex-col items-end">
                  {pageIndex === pages.length - 1 ? (
                    <>
                      {orderData.otherCharges.map((item) => (
                        <div
                          className="w-full flex justify-between text-xs leading-tight"
                          key={"order-charge-" + item.id}
                        >
                          <span className="text-[8px] self-end uppercase">
                            {item.name}
                          </span>
                          <span>{item.amount.toLocaleString()} Ks</span>
                        </div>
                      ))}

                      <div className="w-full flex justify-between text-xs leading-tight">
                        <span className="text-[8px] self-end uppercase">
                          Discount:
                        </span>
                        <span>
                          {(
                            orderData?.totals?.additionalDiscount +
                            orderData?.totals?.orderDiscount
                          ).toLocaleString()}
                          {""}
                          Ks
                        </span>
                      </div>

                      <div className="w-full flex justify-between font-black text-base leading-tight border-b border-[#0f172a] pb-1.5">
                        <span className="text-[9px] self-end mb-0.5 uppercase">
                          Total:
                        </span>
                        <span>{calculatedPayable.toLocaleString()} Ks</span>
                      </div>
                      {debtAmount > 0 && (
                        <div className="w-full flex justify-between text-xs leading-tight">
                          <span className="text-[8px] self-end uppercase">
                            ကျန်ငွေ
                          </span>
                          <span>{debtAmount.toLocaleString()} Ks</span>
                        </div>
                      )}
                      <div className="w-full flex justify-between leading-tight border-b border-[#0f172a] pb-1.5">
                        <span className="text-[9px] self-end mb-0.5 uppercase whitespace-nowrap">
                          Cash Received:
                        </span>
                        <span>{paidAmount.toLocaleString()} Ks</span>
                      </div>
                      <div className="w-full flex justify-between leading-tight border-b border-[#0f172a] pb-1.5">
                        <span className="text-[9px] self-end mb-0.5 uppercase">
                          Balance:
                        </span>
                        <span>
                          {(
                            calculatedPayable +
                            debtAmount -
                            paidAmount
                          ).toLocaleString()}{" "}
                          Ks
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-[8px] text-[#64748b] font-bold uppercase italic mb-1">
                      Continued...
                    </div>
                  )}
                  <div className="text-[8px] font-bold text-[#64748b] tracking-tighter">
                    Page {pageIndex + 1} / {pages.length} —{""}
                    {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
);
