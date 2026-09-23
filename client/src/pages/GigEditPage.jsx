import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GigForm from "../components/GigForm";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import { getGig, updateGig } from "../api";

export default function GigEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    getGig(id)
      .then((gig) => {
        if (!live) return;
        setInitialValues({
          title: gig.title,
          description: gig.description,
          category: gig.category,
          price: gig.price,
        });
      })
      .catch((err) => {
        if (live) setError(err.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id]);

  async function handleSubmit(values) {
    setError("");
    setSaving(true);
    try {
      await updateGig(id, values);
      navigate("/gigs/mine");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading gig" />;
  if (!initialValues) return <ErrorBanner message={error || "Gig not found"} />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>Edit gig</h1>
          <p className="hh-lead">Update the listing. Ownership is checked on the server.</p>
        </div>
      </div>
      <GigForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        error={error}
        loading={saving}
        submitLabel="Save changes"
      />
    </section>
  );
}
