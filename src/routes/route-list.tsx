/* eslint-disable @typescript-eslint/no-explicit-any */
import { refreshToken } from "@/features/auth/auth.action";
import LoginPage from "@/features/auth/login.page";
import BrandPage from "@/features/brand/brand.page";
import CategoryPage from "@/features/category/category.page";
import ErrorPage from "@/features/common/error.page";
import LoadingPage from "@/features/common/loading.page";
import NotFoundPage from "@/features/common/not-found.page";
import DashboardPage from "@/features/dashboard/dashboard.page";
import MediaPage from "@/features/media/media.page";
import POSPage from "@/features/post/pos.page";
import ProductTypePage from "@/features/product-type/product-type.page";
import { getProfile } from "@/features/profile/profile.action";
import Wrapper from "@/features/providers/Wrapper";
import AppLayout from "@/layout/app-layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import type { ErrorResponse } from "../lib/actionHelper";
import { useAuthStore } from "../store/authStore";
import AdminRoute from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoutes";

// 💡 Placeholder Components for New Routes (You will create these later)
const ProductsPage = () => <div>Products Management Page</div>;
const OrdersPage = () => <div>Order History Page</div>;
const CustomersPage = () => <div>Customers List Page</div>;
const StaffPage = () => <div>Staff Management Page</div>;
const PurchasesPage = () => <div>Purchase Orders Page</div>;
const SuppliersPage = () => <div>Suppliers Management Page</div>;
const InventoryPage = () => <div>Stock & Inventory Page</div>;
const StockHistoryPage = () => <div>Stock History Page</div>;
const WarehousesPage = () => <div>Warehouses Management Page</div>;
const LoyaltyLevelsPage = () => <div>Loyalty Levels Setup Page</div>;
const PaymentsPage = () => <div>Payments List Page</div>;
const ReceiptsPage = () => <div>Receipts View Page</div>;
const AdminUsersPage = () => <div>Admin Users Management Page</div>;
const ProductGroupsPage = () => <div>Product Groups Setup Page</div>;
const PaymentMethodsPage = () => <div>Payment Methods Setup Page</div>;
const OtherChargesPage = () => <div>Other Charges Setup Page</div>;
const UnitConversionsPage = () => <div>Unit Conversions Setup Page</div>;
const CarGateLogsPage = () => <div>Car Gate Logs Page</div>;
const SettingsPage = () => <div>General Settings Page</div>;
const FinancialReportsPage = () => <div>Financial Reports Page</div>;

function RouteList() {
  const { accessToken, setAccessToken, setUser } = useAuthStore(
    (state) => state
  );
  const [isLoading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<ErrorResponse | null>(null);

  useEffect(() => {
    const refreshFn = async () => {
      const { response, error } = await refreshToken();
      setLoading(false);
      if (response) {
        setAccessToken(response.result.payload.accessToken);
      }
      if (error) {
        if (axios.isAxiosError(error) && error.status !== 401) {
          setErrorDetails({
            error: {
              detailMessage: error.code ?? error.message,
              referenceId: error.message,
            },
            message: error.message,
            payload: error,
            signature: "",
            status: error.status?.toString() ?? "",
            statusCode: error.status ?? 404,
            timestamp: new Date().toISOString(),
            type: "",
            version: "1",
          });
        } else if ((error as ErrorResponse).payload.status !== 401) {
          setErrorDetails(error as ErrorResponse);
        }
      }
    };
    refreshFn();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { error, response } = await getProfile();
      if (error) {
        console.error("Invalid user", error);
      }
      if (response) {
        const data = response.result;

        setUser(data.payload);

        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem("device_id", deviceId);
        }
      }
    };
    if (accessToken) {
      fetchUser();
    }
  }, [accessToken]);

  if (errorDetails) {
    return <ErrorPage errors={[errorDetails]} />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      {!accessToken ? (
        <Route path="*" element={<LoginPage />} />
      ) : (
        <Route
          path="/"
          element={
            <Wrapper>
              <AppLayout />
            </Wrapper>
          }
        >
          <Route element={<ProtectedRoute />}>
            {/* Sales & POS Routes */}
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="orders" element={<OrdersPage />} />

            {/* Inventory & Products Routes */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="stock-history" element={<StockHistoryPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />

            {/* Purchasing & Suppliers Routes */}
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />

            {/* People & Loyalty Routes */}
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="loyalty-levels" element={<LoyaltyLevelsPage />} />

            {/* Reports & Finance Routes */}
            <Route path="reports/finance" element={<FinancialReportsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />

            {/* Configuration Routes (Admin Only) */}
            <Route element={<AdminRoute />}>
              <Route path="media" element={<MediaPage />} />
              <Route path="admin-users" element={<AdminUsersPage />} />
              <Route path="product-categories" element={<CategoryPage />} />
              <Route path="product-type" element={<ProductTypePage />} />
              <Route path="product-groups" element={<ProductGroupsPage />} />
              <Route path="brands" element={<BrandPage />} />
              <Route path="payment-methods" element={<PaymentMethodsPage />} />
              <Route path="other-charges" element={<OtherChargesPage />} />
              <Route
                path="unit-conversions"
                element={<UnitConversionsPage />}
              />
              <Route path="car-gate" element={<CarGateLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      )}

      {/* 404 fallback - Only if we didn't hit a login page earlier */}
      {accessToken && <Route path="*" element={<NotFoundPage />} />}
    </Routes>
  );
}

export default RouteList;
