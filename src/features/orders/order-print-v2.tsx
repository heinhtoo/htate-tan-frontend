/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from "react";
import headline from "./headline.png";
import type { PaymentResponse } from "./order.response";
import { pyidaungsuBase64 } from "./pdf-assets";
import "./pdf.css";

export const InvoicePrintV2 = forwardRef<
  HTMLDivElement,
  {
    orderData: any;
    watchedItems: any[];
    calculatedPayable: number;
    paymentData: PaymentResponse[];
    warehouseAddress: any;
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
        ? "Mixed"
        : completedPayments[0]?.type || "Credit";

    // Reduced items per page slightly to accommodate increased row height
    const ITEMS_PER_PAGE = 15;
    const pages = [];
    for (let i = 0; i < watchedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(watchedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]);

    if (!orderData) {
      return <></>;
    }

    return (
      <div
        ref={ref}
        className="flex flex-col items-center justify-center invoice-print-v2"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'Pyidaungsu';
              src: url(data:font/truetype;base64,${pyidaungsuBase64}) format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            @media print {
              @page { size: A5 portrait; margin: 0; }
              .print-page { page-break-after: always; position: relative; overflow: hidden; }
              .print-page:last-child { page-break-after: auto; }
              body { -webkit-print-color-adjust: exact; }
            }
          `,
          }}
        />

        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className="print-page w-[140mm] h-[200mm] bg-white text-[#0f172a] flex flex-col font-sans antialiased shrink-0 relative"
            style={{ boxSizing: "border-box" }}
          >
            {/* --- WATERMARK --- */}
            <div className="absolute left-0 bottom-0 top-32 right-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
              <span className="text-[120px] font-black px-8 py-2 rotate-[-35deg] uppercase">
                ထိပ်တန်း
              </span>
            </div>

            {/* --- COMPACT HEADER --- */}
            <div className="p-3 pt-4 text-center relative z-10">
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
            <div className="px-4 grid grid-cols-2 text-[10px] border-y border-[#0f172a] bg-[#f8fafc] z-10">
              <div className="space-y-1 pr-2">
                <div className="flex flex-row items-start">
                  <span className="w-14 shrink-0 font-bold text-[#64748b] text-[8px]">
                    CUSTOMER
                  </span>
                  <span className="mx-1">:</span>
                  <span className="leading-tight">
                    {orderData?.customer?.name || "Walk-in Customer"} {orderData?.customer?.city ? `(${orderData.customer.city})`: ""}
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

            {/* --- Table Section (Reduced height) --- */}
            <div className="grow px-2 pt-1 z-10">
              <table className="w-full text-[10px] border-b border-[#0f172a]">
                <thead>
                  <tr className="bg-[#f1f5f9]">
                    <th className="border border-[#0f172a] py-0.5 w-7 text-center font-bold">
                      No.
                    </th>
                    <th className="border border-[#0f172a] py-0.5 px-2 text-left font-bold">
                      Description
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-12 text-center font-bold">
                      Qty
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-16 text-right pr-1 font-bold">
                      Price
                    </th>
                    <th className="border border-[#0f172a] py-0.5 w-32 text-right pr-1 font-bold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, i) => (
                    <tr key={i} className="h-7 border-b border-[#94a3b8]">
                      <td className="border-x border-[#0f172a] text-center font-mono text-[9px]">
                        {pageIndex * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td className="border-r border-[#0f172a] px-2 font-medium  max-w-[220px]">
                        {item.productSKU && `[${item.productSKU}] `}
                        {item.productName}
                      </td>
                      <td className="border-r border-[#0f172a] text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="border-r border-[#0f172a] text-right pr-1 font-mono">
                        {parseFloat(item.unitPrice + "").toLocaleString()}
                      </td>
                      <td className="border-r border-[#0f172a] text-right pr-1 font-bold font-mono">
                        {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Empty row filler to keep table height consistent */}
                  {Array.from({
                    length: Math.max(0, ITEMS_PER_PAGE - pageItems.length),
                  }).map((_, i) => (
                    <tr key={i} className="h-7 border-b border-[#f1f5f9]">
                      <td className="border-x border-[#0f172a]"></td>
                      <td className="border-r border-[#0f172a]"></td>
                      <td className="border-r border-[#0f172a]"></td>
                      <td className="border-r border-[#0f172a]"></td>
                      <td className="border-r border-[#0f172a]"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2 z-10">
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
                </div>

                <div className="w-48 text-right flex flex-col items-end">
                  {pageIndex === pages.length - 1 ? (
                    <>
                      <div className="w-full flex justify-between text-xs leading-tight">
                        <span className="text-[8px] self-end uppercase">
                          ပို့ဆောင်ခ:
                        </span>
                        <span className="font-mono">
                          {orderData?.totals?.otherCharges.toLocaleString()} Ks
                        </span>
                      </div>
                      <div className="w-full flex justify-between text-xs leading-tight">
                        <span className="text-[8px] self-end uppercase">
                          Discount:
                        </span>
                        <span className="font-mono">
                          {(
                            orderData?.totals?.additionalDiscount +
                            orderData?.totals?.orderDiscount
                          ).toLocaleString()}
                          {""}
                          Ks
                        </span>
                      </div>
                      <div className="w-full flex justify-between font-black text-base leading-tight border-b-2 border-[#0f172a] pb-1.5">
                        <span className="text-[9px] self-end mb-0.5 uppercase">
                          Total:
                        </span>
                        <span className="font-mono">
                          {calculatedPayable.toLocaleString()} Ks
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
