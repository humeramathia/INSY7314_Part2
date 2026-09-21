import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage({ onSubmit, error, loading }) {
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
        <RegisterForm onSubmit={onSubmit} error={error} loading={loading} />
        <p className="hh-auth-links">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
