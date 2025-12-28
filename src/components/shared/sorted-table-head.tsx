import { SortAsc, SortDesc } from "lucide-react";
import { TableHead } from "../ui/table";

/* eslint-disable @typescript-eslint/no-explicit-any */
function SortedTableHead({
  orderBy,
  toggleSort,
  headerName,
  orderKey,
}: {
  orderBy: string;
  toggleSort: (key: any) => void;
  headerName: string;
  orderKey: string;
}) {
  return (
    <TableHead
      className="cursor-pointer select-none hover:bg-gray-100/50 transition-colors"
      onClick={() => toggleSort(orderKey)}
    >
      <div className="flex items-center gap-2">
        <span
          className={
            orderBy.includes(orderKey) ? "text-blue-600 font-bold" : ""
          }
        >
          {headerName}
        </span>

        {/* Dynamic Icon showing the current state */}
        <div className="flex items-center text-muted-foreground/50">
          {orderBy === orderKey + "_asc" && (
            <SortAsc className="h-4 w-4 text-blue-600" />
          )}
          {orderBy === orderKey + "_desc" && (
            <SortDesc className="h-4 w-4 text-blue-600" />
          )}
          {!orderBy.includes(orderKey) && (
            <SortAsc className="h-4 w-4 opacity-0 group-hover:opacity-100" />
          )}
        </div>
      </div>
    </TableHead>
  );
}

export default SortedTableHead;
