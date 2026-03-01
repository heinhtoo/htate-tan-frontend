import AdminPage from "@/features/admin/admin.page";
import { refreshToken } from "@/features/auth/auth.action";
import LoginPage from "@/features/auth/login.page";
import BrandPage from "@/features/brand/brand.page";
import CarGatePage from "@/features/car-gate/car-gate.page";
import CategoryPage from "@/features/category/category.page";
import ErrorPage from "@/features/common/error.page";
import LoadingPage from "@/features/common/loading.page";
import NotFoundPage from "@/features/common/not-found.page";
import CustomerDetailsPage from "@/features/customer/customer-details.page";
import CustomerPage from "@/features/customer/customer.page";
import DashboardPage from "@/features/dashboard/dashboard.page";
import MediaPage from "@/features/media/media.page";
import OrderDetailsPage from "@/features/orders/order-details.page";
import OrderPrintPage from "@/features/orders/order-print.page";
import OrdersPage from "@/features/orders/orders.page";
import OtherChargePage from "@/features/other-charge/other-charge.page";
import PaymentTypePage from "@/features/payment-type/payment-type.page";
import POSPage from "@/features/pos/pos.page";
import ProductTypePage from "@/features/product-type/product-type.page";
import ProductDetailsPage from "@/features/product/product-details.page";
import ProductPage from "@/features/product/product.page";
import { getProfile } from "@/features/profile/profile.action";
import Wrapper from "@/features/providers/Wrapper";
import FinancialReport from "@/features/reports/financial-report";
import SettingPage from "@/features/setting/setting.page";
import StaffPage from "@/features/staff/staff.page";
import UnitConversionPage from "@/features/unit-conversion/unit-conversion.page";
import WarehousePage from "@/features/warehouse/warehouse.page";
import AppLayout from "@/layout/app-layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import type { ErrorResponse } from "../lib/actionHelper";
import { useAuthStore } from "../store/authStore";
import AdminRoute from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoutes";

function RouteList() {
  const { accessToken, setAccessToken, setUser } = useAuthStore(
    (state) => state,
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
            <Route path="pos" element={<POSPage isCustomer={true} />} />
            <Route path="orders" element={<OrdersPage isCustomer={true} />} />
            <Route
              path="orders/:slug"
              element={<OrderDetailsPage isCustomer={true} />}
            />
            <Route path="orders/:slug/print" element={<OrderPrintPage />} />

            {/* Inventory & Products Routes */}

            {/* Configuration Routes (Admin Only) */}
            <Route element={<AdminRoute />}>
              <Route path="products" element={<ProductPage />} />
              <Route path="products/:slug" element={<ProductDetailsPage />} />
              <Route path="warehouses" element={<WarehousePage />} />

              {/* Purchasing & Suppliers Routes */}

              <Route
                path="purchase-pos"
                element={<POSPage isCustomer={false} />}
              />
              <Route
                path="purchase-orders"
                element={<OrdersPage isCustomer={false} />}
              />
              <Route
                path="purchase-orders/:slug"
                element={<OrderDetailsPage isCustomer={false} />}
              />
              <Route
                path="purchase-orders/:slug/print"
                element={<OrderPrintPage />}
              />
              <Route
                path="suppliers"
                element={<CustomerPage isCustomer={false} />}
              />
              <Route path="suppliers/:slug" element={<CustomerDetailsPage />} />

              {/* People & Loyalty Routes */}
              <Route
                path="customers"
                element={<CustomerPage isCustomer={true} />}
              />
              <Route path="customers/:slug" element={<CustomerDetailsPage />} />

              <Route path="staff" element={<StaffPage />} />
              {/* <Route path="loyalty-levels" element={<LoyaltyLevelsPage />} /> */}

              {/* Reports & Finance Routes */}
              <Route path="reports/finance" element={<FinancialReport />} />

              <Route path="media" element={<MediaPage />} />
              <Route path="admin-users" element={<AdminPage />} />
              <Route path="product-categories" element={<CategoryPage />} />
              <Route path="product-type" element={<ProductTypePage />} />
              {/* <Route path="product-groups" element={<ProductGroupPage />} /> */}
              <Route path="brands" element={<BrandPage />} />
              <Route path="payment-methods" element={<PaymentTypePage />} />
              <Route path="other-charges" element={<OtherChargePage />} />
              <Route path="unit-conversions" element={<UnitConversionPage />} />
              <Route path="car-gate" element={<CarGatePage />} />
              <Route path="settings" element={<SettingPage />} />
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
