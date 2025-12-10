import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MediaResponse } from "./media.response";

function MediaCard({ media }: { media: MediaResponse }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <div className="group relative rounded-xl border bg-white p-3">
        <AlertDialogTrigger asChild>
          <div className="flex h-20 max-h-20 w-full cursor-pointer flex-row items-center justify-center overflow-hidden rounded-lg">
            <img
              src={media.url}
              alt={media.filename + "-media"}
              className="max-h-20 w-full object-contain"
            />
          </div>
        </AlertDialogTrigger>
        <div className="absolute right-3 top-3 flex flex-row items-center opacity-0 transition group-hover:opacity-100">
          <Button
            type="button"
            size={"icon"}
            variant={"secondary"}
            className="h-5 w-5 rounded-none rounded-bl-md bg-white p-3 text-gray-600 hover:bg-primary hover:text-white"
            onClick={() => {
              navigator.clipboard
                .writeText(media.url)
                .then(() => {
                  toast.success("URL copied successfully.");
                })
                .catch((err) => {
                  console.error("Failed to copy: ", err);
                });
            }}
          >
            <CopyIcon />
          </Button>
        </div>
      </div>
      <AlertDialogContent className="overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Media</AlertDialogTitle>
          <AlertDialogDescription>{media.filename}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default MediaCard;
