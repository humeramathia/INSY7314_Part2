import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GigForm from "../components/GigForm";
import { createGig } from "../api";

export default function GigCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setError("");
    setLoading(true);
    try {
      await createGig(values);
      navigate("/gigs/mine");
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
          <p className="hh-kicker">Freelancer</p>
          <h1>New gig</h1>
          <p className="hh-lead">Describe the service, set a category, and name your price. The listing is tied to your account.</p>
        </div>
      </div>
      <GigForm onSubmit={handleSubmit} error={error} loading={loading} submitLabel="Publish gig" />
    </section>
  );
}
