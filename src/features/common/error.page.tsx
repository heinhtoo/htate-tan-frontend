/* eslint-disable @typescript-eslint/no-explicit-any */
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErrorResponse } from "@/lib/actionHelper";
import { useApiConfigStore } from "@/store/apiConfigStore";
import { AlertCircle, Home, Phone, RefreshCcw, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ErrorPage({ errors }: { errors: (Error | any)[] }) {
  const errorList = errors.filter(
    (item) => item !== null && item !== undefined
  );
  const { baseURL, setBaseURL } = useApiConfigStore();
  const [ipAddress, setIPAddress] = useState("");

  useEffect(() => {
    setIPAddress(baseURL);
  }, [baseURL]);

  if (errorList.length === 0) return null;

  const mainError = errorList[0] as ErrorResponse;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-6 py-12">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-100 to-transparent -z-10" />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 text-center">
          {/* Error Icon & Code */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 mb-2">
              <AlertCircle size={40} strokeWidth={1.5} />
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold tracking-widest uppercase rounded-full">
              Status Code: {mainError.statusCode || "Error"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            {mainError.message || "Something went wrong"}
          </h1>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-600 leading-relaxed italic">
                "{errorList.map((item) => item.error.detailMessage).join(", ")}"
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
                <span>
                  Ref:{" "}
                  {errorList.map((item) => item.error.referenceId).join(" / ")}
                </span>
              </div>
            </div>
          </div>

          {/* System Configuration Section */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 mb-4 text-slate-500">
              <Settings2 size={16} />
              <span className="text-sm font-medium italic">
                Endpoint Configuration
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
              <Input
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                placeholder="Enter Base URL..."
                value={ipAddress}
                onChange={(e) => setIPAddress(e.currentTarget.value)}
              />
              <Button
                variant="outline"
                className="w-full sm:w-auto flex gap-2"
                onClick={() => setBaseURL(ipAddress)}
              >
                <RefreshCcw size={16} />
                Update
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 flex gap-2"
              asChild
            >
              <Link to="/">
                <Home size={18} />
                Return Home
              </Link>
            </Button>

            <a
              href="tel:+959965007388"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors py-2 px-4"
            >
              <Phone size={16} />
              Support Line
            </a>
          </div>
        </div>

        {/* Footer Area */}
        <div className="bg-slate-50/50 border-t border-slate-100 py-6">
          <Footer isWhite={true} />
        </div>
      </div>
    </main>
  );
}

export default ErrorPage;
