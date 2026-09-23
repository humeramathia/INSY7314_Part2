import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Spinner from "./components/Spinner";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GigListPage from "./pages/GigListPage";
import GigDetailPage from "./pages/GigDetailPage";
import GigCreatePage from "./pages/GigCreatePage";
import GigEditPage from "./pages/GigEditPage";
import MyGigsPage from "./pages/MyGigsPage";
import BookingsPage from "./pages/BookingsPage";
import IncomePage from "./pages/IncomePage";
import AdminGigsPage from "./pages/AdminGigsPage";

export default function App() {
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return <Spinner label="Loading" />;
  }

  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to="/gigs" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/gigs" element={<GigListPage />} />
        <Route
          path="/gigs/new"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <GigCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gigs/mine"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <MyGigsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gigs/:id/edit"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <GigEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/gigs/:id" element={<GigDetailPage />} />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={["client", "freelancer"]}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/income"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <IncomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gigs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminGigsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
