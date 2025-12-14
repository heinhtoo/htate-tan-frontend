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
import { getBrands, removeBrand } from "./brand.action";
import BrandForm from "./brand.from";
import type { BrandResponse } from "./brand.response";

// Mock Data structure based on the Brand entity

export default function BrandPage() {
  const { openPanel } = usePanelStore();
  const { data, error, refetch } = useQuery({
    queryKey: ["brand-all"],
    queryFn: async () => {
      const data = await getBrands({
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
  const handleEdit = (brand: BrandResponse) => {
    openPanel({
      title: `Edit Brand: ${brand.name}`,
      content: (
        <BrandForm initialData={brand} onSubmitComplete={() => refetch()} />
      ),
    });
  };

  const handleAdd = () => {
    openPanel({
      title: "Create New Brand",
      content: (
        <BrandForm initialData={null} onSubmitComplete={() => refetch()} />
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
          Brands ({data?.pagination?.totalItems})
        </CardTitle>
        <div className="w-1/3 flex flex-row items-center gap-3">
          <Input placeholder="Search..." />
          <Button onClick={handleAdd} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add New Brand
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((brand) => (
                <TableRow
                  key={brand.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(brand)}
                >
                  <TableCell>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={brand.imagePath} alt={brand.name} />
                      <AvatarFallback>
                        <Image className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {brand.description || "No description provided."}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center flex-wrap gap-1.5">
                      {brand.productType.map((item) => (
                        <Badge variant="outline" key={item.id}>
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {brand.productCount}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(brand);
                      }}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <DeleteButton
                      deleteAction={async () => {
                        const response = await removeBrand({
                          id: brand.id,
                          version: brand.version,
                        });
                        if (response.response?.isSuccess) {
                          toast.success("Brand deleted successfully.");
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
