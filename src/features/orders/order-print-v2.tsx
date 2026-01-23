/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from "react";
import type { WarehouseResponse } from "../warehouse/warehouse.response";
import type { PaymentResponse } from "./order.response";

export const InvoicePrintV2 = forwardRef<
  HTMLDivElement,
  {
    orderData: any;
    watchedItems: any[];
    calculatedPayable: number;
    paymentData: PaymentResponse[];
    warehouseAddress: WarehouseResponse;
    carGate?: string;
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
    },
    ref,
  ) => {
    const completedPayments =
      paymentData?.filter((p) => p.status === "completed") || [];
    const payTypeDisplay =
      completedPayments.length > 1
        ? "Mixed Payment"
        : completedPayments[0]?.type || "Credit";

    // --- Pagination Logic (15 items per page) ---
    const ITEMS_PER_PAGE = 15;
    const pages = [];
    for (let i = 0; i < watchedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(watchedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]);

    return (
      <div className="hidden">
        <div ref={ref} className="flex flex-col">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media print {
              @page { size: A5 portrait; margin: 0; }
              .print-page { page-break-after: always; }
              .print-page:last-child { page-break-after: auto; }
              body { -webkit-print-color-adjust: exact; }
            }
          `,
            }}
          />

          {pages.map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className="print-page w-[148mm] h-[210mm] bg-white text-slate-900 flex flex-col font-sans antialiased shrink-0"
              style={{ boxSizing: "border-box" }}
            >
              {/* --- HEADER (Exactly as requested) --- */}
              <div className="bg-[#3e451f] text-white p-4 pt-6 text-center relative overflow-hidden">
                <h1 className="text-4xl font-black mb-1 tracking-widest leading-none">
                  ထိပ်တန်း
                </h1>
                <p className="text-sm font-medium tracking-wide">
                  ကိုသိန်းထွန်း + မစိမ့်စိမ့်
                </p>
                <p className="text-[10px] mb-2 opacity-90 italic">
                  ထီး၊ ဦးထုပ်၊ သိုးမွှေးခေါင်းစွပ် ဖြန့်ချီရေး
                </p>
                <div className="text-[9px] leading-relaxed opacity-100 border-t border-white/30 pt-2 mt-1 px-4 text-center inline-block w-full">
                  <p
                    className={
                      warehouseAddress?.id === 2
                        ? "font-bold underline"
                        : "opacity-70"
                    }
                  >
                    ဆိုင်(၁) - ဆိုင်အမှတ် (၈၅၊ ၉၃)၊ ဒုတိယထပ်၊ ရွှေမင်္ဂလာစျေး -
                    09 50 92847
                  </p>
                  <p
                    className={
                      warehouseAddress?.id === 1
                        ? "font-bold underline"
                        : "opacity-70"
                    }
                  >
                    ဆိုင်(၂) - အမှတ် (၁၈၀)၊ စက်ရုံလမ်း၊ မင်္ဂလာမွန်စျေး - 09
                    2540 78179
                  </p>
                </div>
              </div>

              {/* --- METADATA GRID (Exactly as requested) --- */}
              <div className="px-4 py-2 grid grid-cols-2 text-[11px] border-b border-slate-900 bg-slate-50">
                <div className="space-y-1.5 pr-2">
                  <div className="flex">
                    <span className="w-16 shrink-0 font-bold text-slate-500 text-[9px]">
                      CUSTOMER
                    </span>
                    <span className="mx-1">:</span>
                    <span className="font-bold break-words">
                      {orderData?.customer?.name || "Walk-In"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-16 shrink-0 font-bold text-slate-500 text-[9px]">
                      ADDRESS
                    </span>
                    <span className="mx-1">:</span>
                    <span className="break-words leading-tight">
                      {orderData?.customer?.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-16 shrink-0 font-bold text-slate-500 text-[9px]">
                      PHONE
                    </span>
                    <span className="mx-1">:</span>
                    <span className="font-mono">
                      {orderData?.customer?.phone || "-"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 border-l border-slate-300 pl-3">
                  <div className="flex">
                    <span className="w-20 shrink-0 font-bold text-slate-500 text-[9px]">
                      DELIVERY
                    </span>
                    <span className="mx-1">:</span>
                    <span className="break-words leading-tight">
                      {carGate || "N/A"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-20 shrink-0 font-bold text-slate-500 text-[9px]">
                      DATE
                    </span>
                    <span className="mx-1">:</span>
                    <span className="font-mono">
                      {new Date().toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-20 shrink-0 font-bold text-slate-500 text-[9px]">
                      PAY TYPE
                    </span>
                    <span className="mx-1">:</span>
                    <span className="font-bold text-rose-600">
                      {payTypeDisplay}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-center font-bold py-1 text-[10px] bg-white border-b border-slate-900 tracking-[0.4em] uppercase">
                Sales Invoice
              </h2>

              {/* --- Table Section --- */}
              <div className="flex-grow px-2 pt-2">
                <table className="w-full text-[11px] border-collapse border-2 border-slate-900">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 py-1 w-8 text-center font-bold">
                        No.
                      </th>
                      <th className="border border-slate-900 py-1 px-2 text-left font-bold">
                        Description
                      </th>
                      <th className="border border-slate-900 py-1 w-10 text-center font-bold">
                        Qty
                      </th>
                      <th className="border border-slate-900 py-1 w-20 text-right pr-1 font-bold">
                        Price
                      </th>
                      <th className="border border-slate-900 py-1 w-24 text-right pr-1 font-bold font-mono">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, i) => (
                      <tr key={i} className="h-7 border-b border-slate-900">
                        <td className="border border-slate-900 text-center font-mono">
                          {pageIndex * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td className="border border-slate-900 px-2 font-medium py-1">
                          {item.productName}
                        </td>
                        <td className="border border-slate-900 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="border border-slate-900 text-right pr-1 font-mono">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="border border-slate-900 text-right pr-1 font-bold font-mono">
                          {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {/* Fill empty rows */}
                    {Array.from({
                      length: Math.max(0, ITEMS_PER_PAGE - pageItems.length),
                    }).map((_, i) => (
                      <tr key={i} className="h-7 border-b border-slate-900">
                        <td className="border border-slate-900"></td>
                        <td className="border border-slate-900"></td>
                        <td className="border border-slate-900"></td>
                        <td className="border border-slate-900"></td>
                        <td className="border border-slate-900"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- Footer Area --- */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-end pt-3 ">
                  {/* Left: Policy (Only visible on last page or all pages, your choice) */}
                  <div className="w-1/2 space-y-1 text-[9px] text-slate-800 font-medium leading-relaxed italic">
                    <p>• အနာပစ္စည်းများ ၇ ရက်ထက်ကျော်လွန်လျှင် မလဲပေးပါ။</p>
                    <p>• ဘောင်ချာပါမှ အနာပစ္စည်းများအားလဲပေးပါမည်။</p>
                    <p>• ဘောင်ချာမပါလျှင် ဘာပစ္စည်းမှ အလဲမပေးပါ </p>
                  </div>

                  {/* Right: Totals (Last Page) and Page Numbers (Every Page) */}
                  <div className="w-56 text-right flex flex-col items-end">
                    {pageIndex === pages.length - 1 ? (
                      <div className="w-full flex justify-between font-black text-lg leading-tight border-b-4 border-double border-slate-900 mb-2">
                        <span className="text-xs self-end mb-1 uppercase">
                          Total:
                        </span>
                        <span className="font-mono">
                          {calculatedPayable.toLocaleString()} Ks
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-bold uppercase italic mb-2">
                        Continued...
                      </div>
                    )}

                    {/* Page Number at Bottom Right */}
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Page {pageIndex + 1} of {pages.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
