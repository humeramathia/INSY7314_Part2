import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setError("");
    setLoading(true);
    try {
      await register(values);
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
          <p className="hh-kicker">Join the board</p>
          <h1>Create an account</h1>
          <p className="hh-lead">Clients book work. Freelancers list services. One form either way.</p>
        </div>
      </div>
      <div className="hh-panel hh-auth-card">
        <RegisterForm onSubmit={handleSubmit} error={error} loading={loading} />
        <p className="hh-auth-links">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
