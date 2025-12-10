/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useErrorStore } from "../store/error.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

function ErrorDialog() {
  const { error, setError } = useErrorStore((state) => state);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);
  if (!error) {
    return <></>;
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open === false) {
          setError(null);
        }
        setOpen(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{error.error?.detailMessage}</AlertDialogTitle>
          <AlertDialogDescription>
            {error.statusCode} :{" "}
            {error.payload?.message ?? error.error?.detailMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[30vh] overflow-y-auto">
          {error.payload && (
            <Accordion
              type="single"
              defaultValue="item-1"
              collapsible
              className="w-full"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Error details</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1.5 rounded-md bg-red-100 p-3">
                  {Object.entries(error.payload).map(([key, value]) => {
                    if (typeof value === "object" && value !== null) {
                      if (key === "message") {
                        return (
                          <div key={key}>
                            <strong>{key}: </strong>
                            <div className="flex flex-col gap-0.5">
                              {(value as string[]).map((item) => (
                                <span className="text-xs">{item}</span>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={key}>
                          <strong>{key}: </strong>
                          <pre className="whitespace-normal">
                            {JSON.stringify(value)}
                          </pre>
                        </div>
                      );
                    } else {
                      return (
                        <div key={key}>
                          <strong>{key}: </strong>{" "}
                          <span>{value as string}</span>
                        </div>
                      );
                    }
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="mt-3 flex flex-row items-center justify-between gap-1.5 text-xs text-gray-500">
            <span>Reference Id:</span>
            <span>{error.error?.referenceId}</span>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              setError(null);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ErrorDialog;
