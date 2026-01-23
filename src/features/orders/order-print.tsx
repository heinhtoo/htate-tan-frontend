/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from "react";

export const InvoicePrint = forwardRef<
  HTMLDivElement,
  {
    orderData: any;
    watchedItems: any[];
    calculatedPayable: number;
  }
>(({ orderData, watchedItems, calculatedPayable }, ref) => {
  // Reduce this number if items still get too close to the bottom
  const ITEMS_PER_PAGE = 12;

  const pages = [];
  for (let i = 0; i < watchedItems.length; i += ITEMS_PER_PAGE) {
    pages.push(watchedItems.slice(i, i + ITEMS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div className="hidden">
      <div ref={ref}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page {
              size: 155mm 185mm;
              margin: 0;
            }
            .page-container {
              page-break-after: always;
              position: relative;
              width: 155mm;
              height: 185mm;
              padding: 0 15mm;
              box-sizing: border-box;
              font-family: "Pyidaungsu", "Noto Sans Myanmar", sans-serif;
              overflow: hidden; /* Prevents collision/bleeding */
            }
            .page-container:last-child {
              page-break-after: auto;
            }
            .header-spacer {
              height: 50mm; /* Space for pre-printed header */
            }
            .header-info {
              display: flex;
              justify-content: space-between;
              height: 12mm;
              align-items: flex-end;
            }
            
            /* THIS IS THE FIX: A fixed height area for items */
            .items-area {
              height: 95mm; 
              margin-top: 5mm;
              border: 1px dashed transparent; /* Helps debug alignment */
            }

            .items-table {
              width: 100%;
              border-collapse: collapse;
            }
            .items-table td {
              padding: 6px 2px;
              line-height: 1.2;
            }
            .col-qty { width: 12mm; text-align: center; }
            .col-name { width: auto; }
            .col-price { width: 22mm; text-align: right; }
            .col-amount { width: 28mm; text-align: right; }
            
            .footer-area {
              position: absolute;
              bottom: 0;
              left: 15mm;
              right: 15mm;
              height: 25mm; /* Reserved space for total and page number */
            }
            .footer-total {
              text-align: right;
              font-weight: bold;
              font-size: 13px;
              margin-top: 10mm; /* Adjust to match pre-printed Total line */
            }
            .page-number {
              text-align: left;
              font-size: 9px;
              color: #888;
              margin-top: 5mm;
            }
          }
        `,
          }}
        />

        {pages.map((pageItems, index) => (
          <div key={index} className="page-container">
            <div className="header-spacer" />

            <div className="header-info">
              <div>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                  {orderData?.customer?.name ?? "Walk-In"}
                </div>
                <div style={{ fontSize: "10px" }}>
                  {orderData?.customer?.address ?? "N/A"}
                </div>
              </div>
              <div className="date" style={{ fontSize: "11px" }}>
                {new Date().toLocaleDateString("en-CA")}
              </div>
            </div>

            {/* Content Area with Fixed Height */}
            <div className="items-area">
              <table className="items-table">
                <tbody>
                  {pageItems.map((item, i) => (
                    <tr key={i}>
                      <td className="col-qty">{item.quantity}</td>
                      <td className="col-name" style={{ fontSize: "11px" }}>
                        {item.productSKU && `[${item.productSKU}] `}
                        {item.productName}
                      </td>
                      <td className="col-price">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="col-amount">
                        {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Area - Always at the bottom of the sheet */}
            <div className="footer-area">
              <div className="footer-total">
                {index === pages.length - 1 ? (
                  `${calculatedPayable.toLocaleString()} Ks`
                ) : (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "normal",
                      color: "#aaa",
                    }}
                  >
                    Continued...
                  </span>
                )}
              </div>
              <div className="page-number">
                Page {index + 1} of {pages.length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
