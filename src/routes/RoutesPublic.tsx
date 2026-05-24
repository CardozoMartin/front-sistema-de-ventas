

import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "../store/useAuthSession";

const RoutesPublic = () => {
  const { isLoggedIn } = useAuthSession();
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default RoutesPublic;
