import DeleteButton from "@/components/shared/delete-button";
import { PagePagination } from "@/components/shared/page-pagination";
import ResetPasswordButton from "@/components/shared/reset-password-button";
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
import type { ErrorResponse } from "@/lib/actionHelper";
import { useAuthStore } from "@/store/authStore";
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getAdmins, refreshPassword, removeAdmin } from "./admin.action";
import AdminForm from "./admin.from";
import type { AdminResponse } from "./admin.response";

// Mock Data structure based on the Admin entity

export default function AdminPage() {
  const { openPanel } = usePanelStore();
  const [page, setPage] = useState(0);
  const { user } = useAuthStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["admin-all", page],
    queryFn: async () => {
      const data = await getAdmins({
        page: page ? page + "" : "0",
        size: "10",
        s: "",
        q: "",
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });
  const handleEdit = (admin: AdminResponse) => {
    openPanel({
      title: `Edit Admin: ${admin.username}`,
      content: (
        <AdminForm initialData={admin} onSubmitComplete={() => refetch()} />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Admin",
      content: (
        <AdminForm initialData={null} onSubmitComplete={() => refetch()} />
      ),
    });
  };
  const { setError } = useErrorStore();

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Admin ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.data?.length ? (
                data.data.map((admin: AdminResponse) => (
                  <TableRow
                    key={admin.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEdit(admin)}
                  >
                    <TableCell className="font-medium">
                      {admin.username}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(admin);
                        }}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>

                      <ResetPasswordButton
                        deleteAction={async () => {
                          const response = await refreshPassword({
                            id: admin.id,
                          });

                          if (response.response?.isSuccess) {
                            toast.success(
                              "Password reset successfully to `123123`."
                            );
                            refetch();
                          } else {
                            setError(response.error as ErrorResponse);
                          }
                        }}
                      />

                      {admin.id !== user?.id &&
                        data.pagination &&
                        data.pagination?.totalItems > 1 && (
                          <DeleteButton
                            deleteAction={async () => {
                              const response = await removeAdmin({
                                id: admin.id,
                                version: admin.version,
                              });

                              if (response.response?.isSuccess) {
                                toast.success("Admin deleted successfully.");
                                refetch();
                              } else {
                                setError(response.error as ErrorResponse);
                              }
                            }}
                          />
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No admin found.
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
