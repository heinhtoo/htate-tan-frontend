import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

function Error400Page({ message }: { message: string }) {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            400 - Something went wrong
          </h1>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size={"lg"} className="h-12 rounded-full" asChild>
            <Link to="/">Go back to home</Link>
          </Button>
          <a
            href={`mailto:${
              import.meta.env.VITE_CONTACT_EMAIL
            }?subject=Error occurred at ${pathname}&body=${message}`}
            className="text-sm font-semibold text-gray-900"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Error400Page;
