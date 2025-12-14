"use client";
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
import { cn } from "@/lib/utils";
import { KeyRoundIcon } from "lucide-react";
import React, { useState } from "react";

interface ResetPasswordButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  deleteAction: () => void;
  button?: React.ReactNode;
  description?: string;
  isMain?: boolean;
  disabled?: boolean;
}

function ResetPasswordButton({
  description,
  isMain,
  title,
  deleteAction,
  className,
  button,
  disabled,
}: ResetPasswordButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {button ? (
          button
        ) : (
          <Button
            size={"icon"}
            variant={"ghost"}
            className={cn(
              "transition-all hover:bg-destructive hover:text-destructive-foreground",
              className
            )}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen((value) => !value);
            }}
            disabled={disabled ? true : false}
          >
            <KeyRoundIcon className="size-[1.2rem]" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? "Are you sure to reset password?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "Please be aware that this action is irreversible. It will result in the permanent removal of all your data from our servers, with no option for recovery."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteAction();
            }}
            className={
              isMain
                ? ""
                : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
            }
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ResetPasswordButton;
