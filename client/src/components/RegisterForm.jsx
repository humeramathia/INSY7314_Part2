import { useState } from "react";
import ErrorBanner from "./ErrorBanner";

export default function RegisterForm({ onSubmit, error, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({ name, email, password, role });
  }

  return (
    <form className="hh-form" onSubmit={handleSubmit}>
      <ErrorBanner message={error} />
      <label className="hh-field">
        <span>Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Role</span>
        <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit" className="hh-btn" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
