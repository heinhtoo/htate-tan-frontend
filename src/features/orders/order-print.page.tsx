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
    const root = document.documentElement;
    const originalVars: Record<string, string> = {};

    // Main Tailwind CSS semantic variables
    const varsToOverride: Record<string, string> = {
      "--background": "#fefefe",
      "--foreground": "#040404",
      "--card": "#010101",
      "--card-foreground": "#040404",
      "--popover": "#010101",
      "--popover-foreground": "#040404",
      "--primary": "#060507",
      "--primary-foreground": "#f0f0f1",
      "--secondary": "#f1f1f1",
      "--secondary-foreground": "#040404",
      "--muted": "#f1f1f1",
      "--muted-foreground": "#040404",
      "--accent": "#dbdbde",
      "--accent-foreground": "#040404",
      "--destructive": "#b03a25",
      "--destructive-foreground": "#010101",
      "--border": "#e9e9ea",
      "--input": "#e9e9ea",
      "--ring": "#060507",
      "--chart-1": "#b243b1",
      "--chart-2": "#5950d1",
      "--chart-3": "#5ac5db",
      "--chart-4": "#45dbb4",
      "--chart-5": "#dbe345",
      "--sidebar": "#f1f1f1",
    };

    // Default Tailwind color palette (50 → 900)
    const colorsToOverride: Record<string, Record<string, string>> = {
      "--color-red": {
        "50": "#fef2f2",
        "100": "#fee2e2",
        "200": "#fecaca",
        "300": "#fca5a5",
        "400": "#f87171",
        "500": "#ef4444",
        "600": "#dc2626",
        "700": "#b91c1c",
        "800": "#991b1b",
        "900": "#7f1d1d",
      },
      "--color-orange": {
        "50": "#fff7ed",
        "100": "#ffedd5",
        "200": "#fed7aa",
        "300": "#fdba74",
        "400": "#fb923c",
        "500": "#f97316",
        "600": "#ea580c",
        "700": "#c2410c",
        "800": "#9a3412",
        "900": "#7c2d12",
      },
      "--color-amber": {
        "50": "#fffbeb",
        "100": "#fef3c7",
        "200": "#fde68a",
        "300": "#fcd34d",
        "400": "#fbbf24",
        "500": "#f59e0b",
        "600": "#d97706",
        "700": "#b45309",
        "800": "#92400e",
        "900": "#78350f",
      },
      "--color-yellow": {
        "50": "#fefce8",
        "100": "#fef9c3",
        "200": "#fef08a",
        "300": "#fde047",
        "400": "#facc15",
        "500": "#eab308",
        "600": "#ca8a04",
        "700": "#a16207",
        "800": "#854d0e",
        "900": "#713f12",
      },
      "--color-green": {
        "50": "#f0fdf4",
        "100": "#dcfce7",
        "200": "#bbf7d0",
        "300": "#86efac",
        "400": "#4ade80",
        "500": "#22c55e",
        "600": "#16a34a",
        "700": "#15803d",
        "800": "#166534",
        "900": "#14532d",
      },
      "--color-emerald": {
        "50": "#ecfdf5",
        "100": "#d1fae5",
        "200": "#a7f3d0",
        "300": "#6ee7b7",
        "400": "#34d399",
        "500": "#10b981",
        "600": "#059669",
        "700": "#047857",
        "800": "#065f46",
        "900": "#064e3b",
      },
      "--color-teal": {
        "50": "#f0fdfa",
        "100": "#ccfbf1",
        "200": "#99f6e4",
        "300": "#5eead4",
        "400": "#2dd4bf",
        "500": "#14b8a6",
        "600": "#0d9488",
        "700": "#0f766e",
        "800": "#115e59",
        "900": "#134e4a",
      },
      "--color-blue": {
        "50": "#eff6ff",
        "100": "#dbeafe",
        "200": "#bfdbfe",
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8",
        "800": "#1e40af",
        "900": "#1e3a8a",
      },
      "--color-indigo": {
        "50": "#eef2ff",
        "100": "#e0e7ff",
        "200": "#c7d2fe",
        "300": "#a5b4fc",
        "400": "#818cf8",
        "500": "#6366f1",
        "600": "#4f46e5",
        "700": "#4338ca",
        "800": "#3730a3",
        "900": "#312e81",
      },
      "--color-violet": {
        "50": "#f5f3ff",
        "100": "#ede9fe",
        "200": "#ddd6fe",
        "300": "#c4b5fd",
        "400": "#a78bfa",
        "500": "#8b5cf6",
        "600": "#7c3aed",
        "700": "#6d28d9",
        "800": "#5b21b6",
        "900": "#4c1d95",
      },
      "--color-purple": {
        "50": "#faf5ff",
        "100": "#f3e8ff",
        "200": "#e9d5ff",
        "300": "#d8b4fe",
        "400": "#c084fc",
        "500": "#a855f7",
        "600": "#9333ea",
        "700": "#7e22ce",
        "800": "#6b21a8",
        "900": "#581c87",
      },
      "--color-rose": {
        "50": "#fff1f2",
        "100": "#ffe4e6",
        "200": "#fecdd3",
        "300": "#fda4af",
        "400": "#fb7185",
        "500": "#f43f5e",
        "600": "#e11d48",
        "700": "#be123c",
        "800": "#9f1239",
        "900": "#881337",
      },
      "--color-slate": {
        "50": "#f8fafc",
        "100": "#f1f5f9",
        "200": "#e2e8f0",
        "300": "#cbd5e1",
        "400": "#94a3b8",
        "500": "#64748b",
        "600": "#475569",
        "700": "#334155",
        "800": "#1e293b",
        "900": "#0f172a",
      },
      "--color-gray": {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        "200": "#e5e7eb",
        "300": "#d1d5db",
        "400": "#9ca3af",
        "500": "#6b7280",
        "600": "#4b5563",
        "700": "#374151",
        "800": "#1f2937",
        "900": "#111827",
      },
    };

    // Backup and override main vars
    Object.entries(varsToOverride).forEach(([v, hex]) => {
      originalVars[v] = root.style.getPropertyValue(v);
      root.style.setProperty(v, hex);
    });

    // Backup and override all Tailwind color shades
    Object.entries(colorsToOverride).forEach(([colorVar, shades]) => {
      Object.entries(shades).forEach(([shade, hex]) => {
        const varName = `${colorVar}-${shade}`;
        originalVars[varName] = root.style.getPropertyValue(varName);
        root.style.setProperty(varName, hex);
      });
    });

    // Restore original values on unmount
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
                <SelectContent className="bg-white">
                  {printers.map((name) => (
                    <SelectItem key={name} value={name} className="bg-white">
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
