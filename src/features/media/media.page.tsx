import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Image, Loader2, Tag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorPage from "../common/error.page";
import { getMedias, getTags } from "./media.action";

// Assuming MediaAction is updated to handle page/size:
// export const getMedias = async ({ page, size, q, tag }) => { ... }

import SearchInput from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MediaCard from "./media.card";
import MediaUploadButton from "./media.upload.button";

// --- Utility Components (Same as before) ---
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-12 text-blue-500">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    <span className="text-lg">Loading Media...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex h-[50vh] flex-col items-center justify-center gap-6 p-8 bg-gray-50 border border-dashed rounded-lg">
    <Image className="w-16 h-16 text-gray-400" />
    <div className="text-center">
      <h3 className="text-xl font-semibold text-gray-700">
        No media found in this category
      </h3>
      <p className="text-sm text-gray-500">
        Try a different tag, or upload new files to get started.
      </p>
    </div>
  </div>
);

// --- Main Component ---

function MediaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ➡️ UPDATED: Use 'page' instead of 'before' and 'after'
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "default";

  // Convert to numbers for the API call
  const pageNumber = parseInt(page, 10);
  const sizeNumber = parseInt(size, 10);

  const { data, error, isFetching, refetch } = useQuery({
    // ➡️ UPDATED: Query Key uses 'page' and 'size'
    queryKey: ["medias", page, size, q, tag],
    queryFn: async () => {
      // ➡️ UPDATED: Pass pageNumber and sizeNumber to the action
      const data = await getMedias({
        page: pageNumber,
        size: sizeNumber,
        q,
        tag,
      });
      if (data.response) return data.response.data;
      throw data.error;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: tagData } = useQuery({ queryKey: ["tags"], queryFn: getTags });

  if (error) return <ErrorPage errors={[error]} />;

  // ➡️ UPDATED: Destructure API response properties (assuming a `pagination` wrapper is removed)
  const totalItems = data?.totalItems ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const totalPages = data?.totalPages ?? 1;

  const hasNextPage = data?.hasNextPage;
  const hasPreviousPage = data?.hasPreviousPage;
  const nextPage = data?.nextPage;
  const previousPage = data?.previousPage;

  const handlePageChange = (newPage: number | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (!newPage) {
      return;
    }
    // Set the new page number, or delete if it's the first page
    if (newPage > 1) {
      newParams.set("page", newPage.toString());
    } else {
      newParams.delete("page");
    }

    navigate(`/media?${newParams.toString()}`);
  };

  const handleTagChange = (newTag: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tag", newTag);
    // 💡 IMPORTANT: Always reset page to 1 when changing filters (tags or search)
    newParams.delete("page");
    navigate(`/media?${newParams.toString()}`);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* LEFT SIDEBAR: Tag List */}
      <aside className="w-60 bg-white border-r shadow-sm flex flex-col p-4 space-y-6 flex-shrink-0">
        <h2 className="font-bold text-xl text-gray-700 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          Categories
        </h2>

        <div className="flex flex-col gap-1 text-sm overflow-y-auto">
          {tagData?.response?.data.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTagChange(item.name)}
              className={cn(
                "flex justify-between items-center px-3 py-2 rounded-lg transition duration-200 ease-in-out text-left",
                "hover:bg-blue-50 hover:text-blue-700",
                tag === item.name
                  ? "bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-500"
                  : "text-gray-600"
              )}
            >
              <span className="truncate">{item.name}</span>
              <Badge
                variant={tag === item.name ? "default" : "secondary"}
                className={
                  tag === item.name
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-200 text-gray-600"
                }
              >
                {item.files}
              </Badge>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR (Header) */}
        <header className="sticky top-0 bg-white border-b z-10 p-4 shadow-sm">
          <div className="flex justify-between items-center max-w-full mx-auto">
            <div>
              <h1 className="font-bold text-2xl text-gray-800">
                <Image className="inline-block w-6 h-6 mr-2 text-blue-600" />
                Media Library
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Currently viewing <span className="font-semibold">{tag}</span> (
                {totalItems} items total)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SearchInput
                path={`/media?tag=${tag}&size=${size}`}
                placeHolder={`Search ${tag} media...`}
              />

              <MediaUploadButton
                showLabel={true}
                onSubmitComplete={() => {
                  refetch();
                  // Reset to page 1 after upload
                  handlePageChange(1);
                }}
              />
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Active Search/Filter Info */}
          {(q || tag !== "default") && (
            <div className="mb-4 text-gray-600 text-sm flex items-center gap-2">
              Viewing:
              {q && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-300"
                >
                  Search: {q}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-300"
              >
                Tag: {tag}
              </Badge>
            </div>
          )}

          {/* Loading State Overlay */}
          <div
            className={cn(
              "relative",
              isFetching && "opacity-50 pointer-events-none"
            )}
          >
            {isFetching && (
              <div className="absolute inset-0 z-20 flex justify-center items-center">
                <LoadingIndicator />
              </div>
            )}

            {/* Conditional Rendering based on Data */}
            {totalItems === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {/* MEDIA GRID */}
                <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {/* ➡️ UPDATED: Data structure is now data.files */}
                  {data?.files.map((item) => (
                    <MediaCard key={item.url} media={item} />
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="flex justify-between items-center pt-4 border-t mt-6">
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span> (
                    {totalItems} items total).
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      // ➡️ UPDATED: Check for hasPreviousPage and previousPage value
                      disabled={!hasPreviousPage || isFetching}
                      onClick={() => handlePageChange(previousPage)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      // ➡️ UPDATED: Check for hasNextPage and nextPage value
                      disabled={!hasNextPage || isFetching}
                      onClick={() => handlePageChange(nextPage)}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaPage;
