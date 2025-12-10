/* eslint-disable @typescript-eslint/no-explicit-any */
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import type { ErrorResponse } from "@/lib/actionHelper";
import { Link } from "react-router-dom";

function ErrorPage({ errors }: { errors: (Error | any)[] }) {
  const errorList = errors.filter(
    (item) => item !== null && item !== undefined
  );

  if (errorList.length > 0) {
    return (
      <main className="grid h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-primary">
            {errorList[0].statusCode}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900">
            {(errorList[0] as ErrorResponse).message}
          </h1>
          <div className="mt-6">
            <p className="text-lg font-light text-pretty text-gray-700 sm:text-xl/8">
              {errorList.map((item) => item.error.detailMessage)}
            </p>
            <p className="mt-1.5 text-sm text-pretty text-gray-500">
              Reference Code:{" "}
              <span className="font-semibold">
                {errorList.map((item) => item.error.referenceId)}
              </span>
            </p>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size={"lg"} className="h-12 rounded-full" asChild>
              <Link to="/">Go back to home</Link>
            </Button>
            <a
              href={`mailto:${
                import.meta.env.VITE_CONTACT_EMAIL
              }?subject=Error on ${errorList
                .map((item) => item.error.referenceId)
                .join(",")}`}
              className="text-sm font-semibold text-gray-900"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="mt-10">
            <Footer isWhite={true} />
          </div>
        </div>
      </main>
    );
  }

  return <></>;
}

export default ErrorPage;
