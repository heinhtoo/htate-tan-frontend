import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, Tag } from "lucide-react"; // Import Tag and Loader2
import React, { useEffect, useState } from "react";
// Assuming getTags is available in the media.action file
import { cn } from "@/lib/utils";
import { getMedias, getTags } from "./media.action";

function MediaDialog({
  value,
  setValue,
  showLabel,
}: {
  value: string;
  setValue: (value: string) => void;
  showLabel: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [input, setInput] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  // ➡️ NEW STATE: Initialize with "default" tag
  const [tag, setTag] = useState("default");

  // --- 1. Fetch Tags Query ---
  const { data: tagData, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    enabled: open, // Only fetch tags when the dialog is open
  });

  // --- Media Query ---
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "medias",
      page,
      debouncedValue,
      tag, // ➡️ IMPORTANT: Add tag to the query key
    ],
    queryFn: async () => {
      // 💡 NOTE: The existing pagination logic (before/after) remains,
      // but it's cursor-based, not page-based.
      const data = await getMedias({
        page: page,
        size: 30,
        q: debouncedValue,
        tag, // ➡️ Pass the current tag filter
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
    enabled: open, // Only fetch media when the dialog is open
  });

  useEffect(() => {
    setCurrentImage(value);
  }, [value]);

  // Debounce search input logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(input);
      // ➡️ Reset pagination control when search or tag changes
      setPage(1);
    }, 500); // Reduced debounce time for better UX

    return () => {
      clearTimeout(timer);
    };
  }, [input, tag]); // ➡️ Added tag as a dependency to reset pagination on tag change

  const handleTagClick = (newTag: string) => {
    setTag(newTag);
    // ➡️ Reset pagination control when tag changes
    setPage(1);
  };

  // Reset image selection and control state when dialog closes
  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      // Reset dialog internal states on close
      setPage(1);
      setCurrentImage(value); // Revert unsaved selection
      setInput("");
      setTag("default");
    }
    setOpen(newOpenState);
  };

  const mediaFiles = data?.data?.files || [];
  const tagsList = tagData?.response?.data || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className={"rounded-none rounded-r-full"}
          variant={"outline"}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {showLabel ? "Select Media" : ""}
        </Button>
      </DialogTrigger>
      {/* Increased dialog width for better media viewing */}
      <DialogContent className="sm:max-w-7xl p-0 h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Select Media Asset
          </DialogTitle>
          <DialogDescription>
            Browse your media library, filter by tags, and search for files.
            Click save when you're done.
          </DialogDescription>
          <Separator className="mt-2" />
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-0 flex-1 min-h-0">
          {/* Tag Picker and Search Input */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                Filter by Tag:
              </span>

              {isLoadingTags ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <div className="max-w-[50vw] whitespace-nowrap overflow-x-auto flex space-x-2 pb-3">
                  {/* ➡️ Render Tags List */}
                  {tagsList.map((item) => (
                    <Button
                      key={item.name}
                      variant={tag === item.name ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-7 rounded-full text-xs transition-colors",
                        tag === item.name
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => handleTagClick(item.name)}
                    >
                      {item.name} ({item.files})
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <Input
              className="max-w-sm"
              placeholder={`Search media in '${tag}' tag...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Separator />

          {/* Media Grid / Loading / Empty State */}
          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading || isFetching ? (
              <div className="flex min-h-[300px] w-full flex-row items-center justify-center">
                <Icons.spinner className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading files...</span>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 text-gray-500">
                <ImageIcon className="w-10 h-10 mb-3" />
                <p className="text-lg font-medium">No media found</p>
                <p className="text-sm">
                  Try adjusting the search query or selecting a different tag.
                </p>
              </div>
            ) : (
              <div className="grid min-h-[200px] grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 py-1">
                {mediaFiles.map((item) => (
                  <div
                    key={item.url}
                    className="relative flex h-[100px] cursor-pointer items-center justify-center rounded-lg border-2 hover:border-blue-500 transition-all"
                    style={{
                      borderColor:
                        currentImage === item.url
                          ? "rgb(59, 130, 246)"
                          : "transparent",
                    }}
                    onClick={() => {
                      setCurrentImage(item.url);
                    }}
                  >
                    <img
                      className="h-full w-full rounded-md object-cover"
                      src={item.url}
                      alt="Media thumbnail"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/20 rounded-lg transition-opacity",
                        currentImage === item.url
                          ? "opacity-100 border-4 border-blue-500"
                          : "opacity-0"
                      )}
                    />
                    <Checkbox
                      className="absolute left-2 top-2 z-10 bg-white border-gray-400"
                      checked={currentImage === item.url}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />
        <DialogFooter className="p-6 pt-2">
          <p className="mr-auto text-sm text-gray-500">
            Selected Image:{" "}
            {currentImage.length > 30
              ? currentImage.substring(0, 30) + "..."
              : currentImage || "None"}
          </p>
          <div className="flex flex-row items-center gap-3">
            {data?.data.hasPreviousPage && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setPage((prevValue) => prevValue - 1)}
                  disabled={isFetching}
                >
                  Prev
                </Button>
              </div>
            )}
            {data?.data.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setPage((prevValue) => prevValue + 1)}
                  disabled={isFetching}
                >
                  Next
                </Button>
              </div>
            )}

            <Button
              type="submit"
              disabled={!currentImage} // Disable save if no image is selected
              onClick={() => {
                setValue(currentImage);
                setOpen(false);
              }}
            >
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MediaDialog;
