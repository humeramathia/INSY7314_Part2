import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
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
import { SAMPLE_USER } from "./sampleData";

const PREVIEW_ROLES = [
  { id: null, label: "Logged out" },
  { id: "client", label: "Client" },
  { id: "freelancer", label: "Freelancer" },
  { id: "admin", label: "Admin" },
];

function userFromRole(role) {
  if (!role) return null;
  return { ...SAMPLE_USER, role, name: role === "admin" ? "Admin Pat" : SAMPLE_USER.name };
}

function AppRoutes({ user, setUser }) {
  const navigate = useNavigate();

  return (
    <Layout user={user} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<Navigate to="/gigs" replace />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onSubmit={({ email }) =>
                setUser({ name: email || "Client", role: "client", email })
              }
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              onSubmit={({ name, role, email }) => setUser({ name, role, email })}
            />
          }
        />
        <Route path="/gigs" element={<GigListPage />} />
        <Route
          path="/gigs/new"
          element={<GigCreatePage onSubmit={() => navigate("/gigs/mine")} />}
        />
        <Route
          path="/gigs/mine"
          element={
            <MyGigsPage
              onEdit={(id) => navigate(`/gigs/${id}/edit`)}
              onDelete={() => {}}
            />
          }
        />
        <Route path="/gigs/:id/edit" element={<GigEditPage onSubmit={() => navigate("/gigs/mine")} />} />
        <Route
          path="/gigs/:id"
          element={<GigDetailPage canBook={user?.role === "client"} onBook={() => navigate("/bookings")} />}
        />
        <Route path="/bookings" element={<BookingsPage role={user?.role || "client"} onConfirm={() => {}} />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/admin/gigs" element={<AdminGigsPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState(userFromRole("freelancer"));

  return (
    <BrowserRouter>
      <div className="hh-preview">
        <span>Design preview · Lilitha can delete this bar</span>
        {PREVIEW_ROLES.map((item) => (
          <button
            key={String(item.id)}
            type="button"
            className={user?.role === item.id || (!user && item.id === null) ? "is-active" : ""}
            onClick={() => setUser(userFromRole(item.id))}
          >
            {item.label}
          </button>
        ))}
      </div>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}
