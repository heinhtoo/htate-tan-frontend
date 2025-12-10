/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ErrorResponse } from "@/lib/actionHelper";
import { AxiosError } from "axios";
import { uniqBy } from "lodash";
import { AlertCircle } from "lucide-react";

function ErrorLog({ errors }: { errors: any[] }) {
  const errorList = errors.filter(
    (item) => item !== null && item !== undefined
  );

  if (errorList.length > 0) {
    return (
      <div className="mb-5 flex flex-col gap-3">
        {uniqBy(errorList, "error.detailMessage").map((item, index) => (
          <Alert variant="destructive" key={`error-${index}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(item as ErrorResponse)?.payload?.message ??
                (item as ErrorResponse)?.error?.detailMessage ??
                (item as AxiosError).message}
            </AlertDescription>
            {(item as ErrorResponse).error?.referenceId && (
              <span className="text-xs">
                Reference Id: {(item as ErrorResponse).error?.referenceId}
              </span>
            )}
          </Alert>
        ))}
      </div>
    );
  }

  return <></>;
}

export default ErrorLog;
