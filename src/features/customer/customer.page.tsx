import DeleteButton from "@/components/shared/delete-button";
import { PagePagination } from "@/components/shared/page-pagination";
import SortedTableHead from "@/components/shared/sorted-table-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import type { ErrorResponse } from "@/lib/actionHelper";
import { formatCurrency } from "@/lib/currencyHelper";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getCustomers, removeCustomer } from "./customer.action";
import CustomerForm from "./customer.from";
import type { CustomerResponse } from "./customer.response";

export default function CustomerPage({ isCustomer }: { isCustomer: boolean }) {
  const { openPanel } = usePanelStore();
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState("");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const { data, error, refetch } = useQuery({
    queryKey: ["customer-all", page, debouncedQuery, orderBy, isCustomer],
    queryFn: async () => {
      const data = await getCustomers({
        page: page ? page + "" : "0",
        size: "3000",
        s: orderBy,
        q: debouncedQuery,
        isCustomer,
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });
  const handleEdit = (customer: CustomerResponse) => {
    openPanel({
      title: `Edit ${isCustomer ? "Customer" : "Supplier"}: ${customer.name}`,
      content: (
        <CustomerForm
          initialData={customer}
          onSubmitComplete={() => refetch()}
          isCustomer={isCustomer}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: `Create New ${isCustomer ? "Customer" : "Supplier"}`,
      content: (
        <CustomerForm
          initialData={null}
          onSubmitComplete={() => refetch()}
          isCustomer={isCustomer}
        />
      ),
    });
  };
  const { setError } = useErrorStore();

  if (error) {
    return <ErrorPage errors={[error]} />;
  }
  const toggleSort = (type: "name" | "phone" | "address" | "total_debt") => {
    setOrderBy((prev) => {
      if (prev === `${type}_asc`) return `${type}_desc`;
      return `${type}_asc`;
    });
  };
  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          {isCustomer ? "Customer" : "Supplier"} ({data?.pagination?.totalItems}
          )
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
            }}
          />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New
            {isCustomer ? "Customer" : "Supplier"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <SortedTableHead
                  headerName="Name"
                  orderBy={orderBy}
                  orderKey="name"
                  toggleSort={toggleSort}
                />
                <SortedTableHead
                  headerName="Phone"
                  orderBy={orderBy}
                  orderKey="phone"
                  toggleSort={toggleSort}
                />
                <SortedTableHead
                  headerName="Address"
                  orderBy={orderBy}
                  orderKey="address"
                  toggleSort={toggleSort}
                />
                <TableHead>Total Credit</TableHead>
                <SortedTableHead
                  headerName="Total Debt"
                  orderBy={orderBy}
                  orderKey="total_debt"
                  toggleSort={toggleSort}
                />
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.data?.length ? (
                data.data.map((customer: CustomerResponse) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate("/customers/" + customer.id)}
                  >
                    <TableCell>{customer.name || "-"}</TableCell>

                    <TableCell>{customer.phoneNumber || "-"}</TableCell>

                    <TableCell>{customer.address}</TableCell>

                    <TableCell>
                      {/* Calculation Logic */}
                      {(() => {
                        if (parseFloat(customer.creditLimit + "") === 0.0) {
                          return (
                            <div className="flex flex-col items-start min-w-[180px]">
                              {customer.totalDebt > 0 ? (
                                // SCENARIO A: No Limit AND Debt Exists
                                <>
                                  <span className="text-red-600 font-bold text-lg">
                                    {formatCurrency(customer.totalDebt)}
                                  </span>
                                  <span className="text-red-500 text-xs font-semibold mt-0.5">
                                    ⚠ Debt with No Limit
                                  </span>
                                </>
                              ) : (
                                // SCENARIO B: No Limit AND No Debt
                                <div className="text-gray-400 text-sm italic">
                                  No Limit Assigned
                                </div>
                              )}
                            </div>
                          );
                        }

                        const percentage = Math.min(
                          (customer.totalDebt / customer.creditLimit) * 100,
                          100
                        );
                        const isOverLimit =
                          customer.totalDebt > customer.creditLimit;
                        const barColor = isOverLimit
                          ? "bg-red-500"
                          : percentage > 80
                            ? "bg-yellow-500"
                            : "bg-green-500";
                        const available =
                          customer.creditLimit - customer.totalDebt;

                        return (
                          <div className="flex flex-col gap-1 min-w-[180px]">
                            {/* Top Row: Debt vs Limit */}
                            <div className="flex justify-between text-sm font-medium">
                              <span
                                className={
                                  isOverLimit ? "text-red-600" : "text-gray-900"
                                }
                              >
                                {formatCurrency(customer.totalDebt)}
                              </span>
                              <span className="text-gray-400 text-xs mt-1">
                                / {formatCurrency(customer.creditLimit)}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-2.5 rounded-full ${barColor}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            {/* Bottom Row: Status Text */}
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                {percentage.toFixed(0)}% Used
                              </span>
                              {isOverLimit ? (
                                <span className="text-red-600 font-bold">
                                  OVER LIMIT
                                </span>
                              ) : (
                                <span className="text-green-600">
                                  {formatCurrency(available)} left
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>{formatCurrency(customer.totalDebt)}</TableCell>

                    <TableCell className="text-right space-x-2">
                      {/* 
                      // TODO add customer details
                      <Button variant={"ghost"} asChild>
                        <Link to={"/customers/" + customer.id}>
                          <ListIcon className="h-4 w-4" />
                        </Link>
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(customer);
                        }}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>

                      <DeleteButton
                        deleteAction={async () => {
                          const response = await removeCustomer({
                            id: customer.id,
                            version: customer.version,
                          });

                          if (response.response?.isSuccess) {
                            toast.success("Customer deleted successfully.");
                            refetch();
                          } else {
                            setError(response.error as ErrorResponse);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No {isCustomer ? "Customer" : "Supplier"} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <PagePagination
          pagination={data?.pagination}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </CardContent>
    </Card>
  );
}
