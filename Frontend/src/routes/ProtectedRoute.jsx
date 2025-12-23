import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // Assuming you store role on login
  const location = useLocation();

  if (!token) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Optional: Check for specific roles if you pass them as props
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;