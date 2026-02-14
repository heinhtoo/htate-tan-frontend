import ErrorLog from "@/layout/error-log";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Monitor } from "lucide-react"; // Assuming Lucide for icons
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { getServerInfo } from "./common.action";

function ServerPage() {
  const [copied, setCopied] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: ["server-info"],
    queryFn: async () => {
      const res = await getServerInfo();
      if (res.response) return res.response;
      throw res.error;
    },
  });

  const handleCopy = async () => {
    if (data?.frontendUrl) {
      await navigator.clipboard.writeText(data.frontendUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading connection info...
      </div>
    );
  if (error) return <ErrorLog errors={[error]} />;

  const url = data?.frontendUrl || "";

  return (
    <div className="sm:min-w-lg flex flex-col items-center justify-center min-h-[400px] p-6 bg-primary rounded-3xl rounded-l-none border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-primary-foreground flex items-center justify-center gap-2">
          <Monitor size={20} /> Connect Mobile Device
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Scan the QR code to open the app on your phone
        </p>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-4 rounded-2xl shadow-md border-4 border-white mb-6 transition-transform hover:scale-105">
        <QRCodeSVG
          value={url}
          size={200}
          level="H" // High error correction for easier scanning
          includeMargin={false}
          imageSettings={{
            src: "/logo.png", // Optional: Add your logo in the middle
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      {/* URL / Action Section */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-300">
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs font-mono text-gray-600 truncate px-2 outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-blue-600"
            title="Copy URL"
          >
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <Copy size={18} />
            )}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 italic">
        Make sure your device is on the same network.
      </p>
    </div>
  );
}

export default ServerPage;
