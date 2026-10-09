import { Navigate } from "react-router-dom";
import ErrorBanner from "./components/ErrorBanner";
import Spinner from "./components/Spinner";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <Spinner label="Checking session" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <ErrorBanner message="You do not have access to this page." />;
  }

  return children;
}
