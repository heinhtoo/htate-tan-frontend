import ForbiddenPage from "@/features/common/forbidden.page";
import LoadingPage from "@/features/common/loading.page";
import { useAuthStore } from "@/store/authStore";
import { Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { user } = useAuthStore((state) => state);

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (user.isAdmin) {
    return <Outlet />;
  }

  return <ForbiddenPage />;
};

export default AdminRoute;
