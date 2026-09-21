import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage({ onSubmit, error, loading }) {
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
        <LoginForm onSubmit={onSubmit} error={error} loading={loading} />
        <p className="hh-auth-links">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
