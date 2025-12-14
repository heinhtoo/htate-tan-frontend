import DeleteButton from "@/components/shared/delete-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useErrorStore } from "@/store/error.store";
import { usePanelStore } from "@/store/panelStore"; // Assume this is the global store
import { useQuery } from "@tanstack/react-query";
import { Edit, Image, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import ErrorPage from "../common/error.page";
import { getCategories, removeCategory } from "./category.action";
import CategoryForm from "./category.from";
import type { CategoryResponse } from "./category.response";

// Mock Data structure based on the Category entity

export default function CategoryPage() {
  const { openPanel } = usePanelStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["category-all"],
    queryFn: async () => {
      const data = await getCategories({
        page: "0",
        size: "0",
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

  const { setError } = useErrorStore();

  const handleEdit = (category: CategoryResponse) => {
    openPanel({
      title: `Edit Category: ${category.name}`,
      content: (
        <CategoryForm
          initialData={category}
          onSubmitComplete={() => refetch()}
        />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Category",
      content: (
        <CategoryForm initialData={null} onSubmitComplete={() => refetch()} />
      ),
    });
  };

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  return (
    <Card className="m-6 h-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          Categories ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((category) => (
                <TableRow
                  key={category.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(category)}
                >
                  <TableCell>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={category.imagePath}
                        alt={category.name}
                      />
                      <AvatarFallback>
                        <Image className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {category.description || "No description provided."}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.productType?.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {category.productCount}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeCategory({
                          id: category.id,
                          version: category.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success("Category deleted successfully.");
                          refetch();
                        } else {
                          setError(response.error as ErrorResponse);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
