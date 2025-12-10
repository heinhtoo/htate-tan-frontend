import { cn } from "@/lib/utils";

function Footer({ isWhite }: { isWhite?: boolean }) {
  return (
    <div
      className={cn(
        `flex flex-row items-start justify-center pb-1.5 text-center text-gray-300 gap-0.5`,
        isWhite ? "text-gray-600" : ""
      )}
    >
      <p className="text-xs whitespace-nowrap">Designed and developed by</p>
      <a
        className="flex flex-row items-center gap-1.5 text-xs font-semibold text-primary underline"
        href="tel:+959965007388"
        target="_blank"
        rel="noopener"
      >
        Hein Htoo
      </a>
    </div>
  );
}

export default Footer;
