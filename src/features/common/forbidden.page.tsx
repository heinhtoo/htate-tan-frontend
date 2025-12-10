import { Link } from "react-router-dom";

function ForbiddenPage() {
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="text-gray-500">
            The page you're looking for doesn’t exist or you may not have
            permission to view it.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-white shadow-sm px-8 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default ForbiddenPage;
