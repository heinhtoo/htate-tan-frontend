import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import MediaDialog from "./media-dialog";
import MediaUploadButton from "./media.upload.button";

function ImageButton({
  value,
  setValue,
  className,
  aspectRatio,
}: {
  value: string | undefined;
  setValue: (value: string) => void;
  className?: string;
  aspectRatio?: number;
}) {
  const [warning, setWarning] = useState<string | null>(null);

  function checkAspectRatio(
    width: number,
    height: number,
    targetAspectRatio: number,
    tolerance = 0.1 // allow some tolerance, e.g. ±10%
  ): string | null {
    if (!width || !height) return null;

    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - targetAspectRatio) > tolerance) {
      // Aspect ratio difference too big
      return `Warning: This image aspect ratio (${aspectRatio.toFixed(
        2
      )}) is not suitable. Recommended aspect ratio is about ${targetAspectRatio.toFixed(
        2
      )}`;
    }

    return null;
  }

  useEffect(() => {
    if (!value) return;

    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;

      if (aspectRatio) {
        const message = checkAspectRatio(width, height, aspectRatio); // your target aspect ratio (e.g. 1080/400 = 2.7)
        setWarning(message);
      }
      // You can pass them somewhere if needed (e.g., to a form)
    };
    img.src = value;
  }, [value]);

  return (
    <div
      className={cn(
        `relative flex flex-row flex-wrap items-center justify-center gap-5 overflow-hidden rounded-3xl w-full`
      )}
    >
      {value && (
        <img
          src={value}
          className={cn("w-20 rounded-md object-cover")}
          key={value}
        />
      )}

      <div
        className={cn(
          `flex flex-row items-center justify-center z-10`,
          className
        )}
      >
        <MediaUploadButton
          isUpload={true}
          showLabel={value ? false : true}
          tag="default"
          onUploadFn={(assetUrl) => {
            setValue(assetUrl);
          }}
          onSubmitComplete={() => {}}
        />

        <MediaDialog
          value={value ?? ""}
          showLabel={value ? false : true}
          setValue={(value) => {
            setValue(value);
          }}
        />
      </div>

      {warning && (
        <p className="text-red-600 absolute inset-0 text-xs p-5 z-0">
          {warning}
        </p>
      )}
    </div>
  );
}

export default ImageButton;
