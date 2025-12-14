import { Button } from "@/components/ui/button"; // ShadCN Button component
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PlusCircle } from "lucide-react"; // Icons for visual appeal
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Link } from "react-router-dom"; // Assuming you use react-router for navigation
import ErrorPage from "../common/error.page";
import ProductDetails from "./product-details"; // Your main view component
import ProductForm from "./product-form"; // Your form component
import { getProduct } from "./product.action";

// Helper component to add a consistent header/layout
const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  backPath?: string;
}> = ({ title, subtitle, backPath }) => (
  <div className="mb-8 border-b pb-4">
    <div className="flex items-center space-x-3">
      {backPath && (
        <Link to={backPath}>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>
    </div>
    {subtitle && (
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    )}
  </div>
);

function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParam] = useSearchParams();
  const mode = searchParam.get("mode");
  const navigate = useNavigate();
  const { data, error, refetch } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const data = await getProduct({
        sku: slug ?? "",
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });

  const handleFormSubmitComplete = () => {
    refetch();
    navigate("/products");
  };

  if (slug === "create") {
    return (
      <div className="max-w-4xl w-full mx-auto p-6 lg:p-10 bg-white shadow-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <PageHeader
          title="Create New Product"
          subtitle="Define the core details, pricing, and relationships for your new item."
          backPath="/products"
        />
        <div className="space-y-6">
          <ProductForm
            initialData={null}
            onSubmitComplete={handleFormSubmitComplete}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage errors={[error]} />;
  }

  if (mode === "edit" && data && data.data) {
    return (
      <div className="max-w-4xl w-full mx-auto p-6 lg:p-10 bg-white shadow-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <PageHeader
          title="Edit Product"
          subtitle="Define the core details, pricing, and relationships for your new item."
          backPath="/products"
        />
        <div className="space-y-6">
          <ProductForm
            initialData={data.data}
            onSubmitComplete={handleFormSubmitComplete}
          />
        </div>
      </div>
    );
  }

  // --- 2. EDIT MODE (Check if slug is a numeric ID) ---
  if (data && data.data) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <ProductDetails
          product={data.data}
          refetch={() => {
            refetch();
          }}
        />
      </div>
    );
  }

  // --- 3. FALLBACK (404-like) ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800">
        Product Not Found
      </h2>
      <p className="text-muted-foreground mt-2">
        The product ID or route you requested is invalid.
      </p>
      <Link to="/products">
        <Button variant="link" className="mt-4">
          Go back to Product List
        </Button>
      </Link>
    </div>
  );
}

export default ProductDetailsPage;
