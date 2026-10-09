import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setError("");
    setLoading(true);
    try {
      await login(values);
      navigate("/gigs");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Welcome back</p>
          <h1>Sign in</h1>
          <p className="hh-lead">Use the email and password from your HustleHub+ account.</p>
        </div>
      </div>
      <div className="hh-panel hh-auth-card">
        <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />
        <p className="hh-auth-links">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
