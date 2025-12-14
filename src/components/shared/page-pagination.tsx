"use client";

import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadPagination,
} from "@/components/ui/pagination";
import type { PaginationProps } from "@/types/response";

type PagePaginationProps = {
  pagination?: PaginationProps;
  onPageChange: (page: number) => void;
};

export function PagePagination({
  pagination,
  onPageChange,
}: PagePaginationProps) {
  if (!pagination) {
    return <></>;
  }

  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  return (
    <ShadPagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => hasPreviousPage && onPageChange(currentPage - 1)}
            className={!hasPreviousPage ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => hasNextPage && onPageChange(currentPage + 1)}
            className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadPagination>
  );
}
