/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowLeft, Clock, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import LoadingPage from "../common/loading.page";
import { getPrinters, printPdf } from "../printer/printer.action";
import { InvoicePrintV2 } from "./order-print-v2";
import { getOrderDetails } from "./orders.action";

export default function OrderPrintPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [printers, setPrinters] = useState<string[]>([]);
  const [isCloudPrinting, setIsCloudPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", slug],
    queryFn: () => getOrderDetails({ slug: slug ?? "" }),
  });

  const orderData = order?.response?.data;

  useEffect(() => {
    // Store original Tailwind variables
    const root = document.documentElement;
    const originalVars: Record<string, string> = {};

    // List of Tailwind CSS variables that use oklch or cause PDF issues
    const varsToOverride = [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--popover",
      "--popover-foreground",
      "--primary",
      "--primary-foreground",
      "--secondary",
      "--secondary-foreground",
      "--muted",
      "--muted-foreground",
      "--accent",
      "--accent-foreground",
      "--border",
      "--input",
      "--ring",
    ];

    // Backup and override them
    varsToOverride.forEach((v) => {
      originalVars[v] = root.style.getPropertyValue(v);
      root.style.setProperty(v, "#000"); // or neutral color
    });

    // You can also reset to white background etc.
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--foreground", "#000000");

    // When unmounting, restore them
    return () => {
      Object.entries(originalVars).forEach(([v, val]) => {
        if (val) root.style.setProperty(v, val);
        else root.style.removeProperty(v);
      });
    };
  }, []);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const data = await getPrinters();
        if (data.response) {
          const printersList = data.response as string[];
          setPrinters(printersList);
          if (printersList.length > 0 && !selectedPrinter) {
            setSelectedPrinter(printersList[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch printers", error);
      }
    };
    fetchPrinters();
  }, []);

  const generatePDFBlob = async () => {
    if (!orderData || !printRef.current) return null;

    // Scroll to top to ensure html2canvas captures correctly without offsets
    window.scrollTo(0, 0);

    const element = printRef.current;
    const pages = element.querySelectorAll(".print-page");
    if (pages.length === 0) return null;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;

      // Render page to high-resolution canvas
      const canvas = await html2canvas(page, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: 0, // Ensure no scroll offset
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Calculate image height to maintain aspect ratio
      const imgProps = doc.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Cap image height to pdfHeight to prevent vertical clipping
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
      }
      if (i > 0) doc.addPage();
      doc.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    }

    return doc.output("blob");
  };

  const handleCloudPrint = async () => {
    if (!selectedPrinter) {
      toast.error("Please select a printer first");
      return;
    }

    setIsCloudPrinting(true);
    const toastId = toast.loading("Generating Secure PDF...");

    try {
      const pdfBlob = await generatePDFBlob();
      if (!pdfBlob) throw new Error("Failed to generate PDF");

      toast.loading("Sending to printer...", { id: toastId });

      const result = await printPdf({
        file: pdfBlob,
        printerName: selectedPrinter,
      });

      if (result.response) {
        toast.success("Print job submitted successfully", { id: toastId });
      } else {
        throw new Error(result.error?.message || "Failed to submit print job");
      }
    } catch (error: any) {
      toast.error(error.message || "Print failed", { id: toastId });
    } finally {
      setIsCloudPrinting(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!orderData)
    return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/orders/${slug}`}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                Print Preview
              </h1>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Voucher: {orderData.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-4">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Printer:
              </Label>
              <Select
                value={selectedPrinter}
                onValueChange={setSelectedPrinter}
              >
                <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select Printer" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCloudPrint}
              disabled={isCloudPrinting || !selectedPrinter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-9 font-bold shadow-lg shadow-indigo-100"
            >
              {isCloudPrinting ? (
                <Clock size={16} className="animate-spin mr-2" />
              ) : (
                <Printer size={16} className="mr-2" />
              )}
              Cloud Print
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="md:hidden mb-6">
          <Card className="p-4 rounded-2xl border-none shadow-sm ring-1 ring-slate-100">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Printer Settings
            </Label>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger className="w-full h-10 text-sm rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select Printer" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* The Actual Preview Component */}
        <div className="flex justify-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 md:p-8 min-h-[600px] ring-1 ring-slate-100">
          <div
            ref={printRef}
            className="transform scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top"
          >
            <InvoicePrintV2
              orderData={orderData}
              watchedItems={orderData.items}
              calculatedPayable={orderData.totals.payable}
              paymentData={orderData.payments}
              warehouseAddress={orderData.warehouse}
              carGate={orderData.carGate?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
