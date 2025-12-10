/* eslint-disable react-hooks/set-state-in-effect */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { ErrorResponse } from "@/lib/actionHelper";
import { PlusIcon, UploadIcon } from "lucide-react";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadMedia } from "./media.action";

function MediaUploadButton({
  isUpload,
  tag: tg,
  onUploadFn,
  showLabel,
  onSubmitComplete,
}: {
  isUpload?: boolean;
  tag?: string;
  onUploadFn?: (assetUrl: string) => void;
  showLabel: boolean;
  onSubmitComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setTransaction] = useTransition();
  const [file, setFile] = useState<FileList | null>(null);
  const [tag, setTag] = useState("default");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setTag(tg ?? "default");
  }, [tg]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      event.target.files &&
      event.target.files.length > 0 &&
      event.target.files.length <= (onUploadFn ? 1 : 10)
    ) {
      setFile(event.target.files);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onUploadFn) {
        toast.error("Please input file");
      } else {
        toast.error("You can only upload up to 10 files");
      }
    }
  };

  const handleUpload = async () => {
    setTransaction(async () => {
      if (!file || file.length === 0) {
        toast.warning("Please select a file first!");
        return;
      }
      if (onUploadFn) {
        try {
          const formData = new FormData();
          formData.append("tag", tag);
          formData.append("files", file[0]);
          const response = await uploadMedia({
            formData,
          });
          if (response.response) {
            toast.success(`Media uploaded successfully.`);
            if (onUploadFn) {
              onUploadFn(response.response.result.payload.files[0].url);
            }
            onSubmitComplete();
          } else if (response.error) {
            toast.error(response.error.message);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("An error occurred while uploading the file.");
        }
      } else {
        for (let i = 0; i < file.length; i++) {
          const formData = new FormData();
          formData.append("tag", tag);
          formData.append("files", file[i]);
          const data = await uploadMedia({
            formData,
          });
          if (data.error) {
            toast.error((data.error as ErrorResponse).message);
          }
          setCurrentIndex(i);
        }
        onSubmitComplete();
      }
    });
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {isUpload ? (
            <Button
              className="rounded-l-full rounded-r-none border-r-0"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <UploadIcon />
              {showLabel ? "Upload" : ""}
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
              className="h-10"
            >
              <PlusIcon />
              Upload
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Media Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Media for attractions
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3">
            <Label>Image</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              accept={"image/*"}
              ref={fileInputRef}
              multiple={onUploadFn ? false : true}
            />
            <Label>Tag</Label>
            <Input
              type="text"
              disabled={isLoading}
              value={tag}
              onChange={(e) => {
                setTag(e.currentTarget.value);
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpload} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isLoading === true &&
        file &&
        file.length > 1 &&
        currentIndex + 1 !== file.length && (
          <div className="fixed bottom-5 right-5 flex flex-col gap-3 rounded-md border bg-white p-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">Uploading file</h3>
              <p className="text-xs font-medium">
                {currentIndex + 1} / {file.length}
              </p>
            </div>
            <Progress value={((currentIndex + 1) * 100) / file.length} />
          </div>
        )}
    </>
  );
}

export default MediaUploadButton;
