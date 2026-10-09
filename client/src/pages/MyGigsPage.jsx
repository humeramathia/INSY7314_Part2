import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice } from "../format";
import { deleteGig, myGigs } from "../api";

export default function MyGigsPage() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    return myGigs()
      .then((data) => setGigs(data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    let live = true;
    myGigs()
      .then((data) => {
        if (live) setGigs(data || []);
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
  }, []);

  async function handleDelete(id) {
    setError("");
    try {
      await deleteGig(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Spinner label="Loading your gigs" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>My gigs</h1>
          <p className="hh-lead">Edit or remove listings you own. Nobody else can change these.</p>
        </div>
        <button type="button" className="hh-btn" onClick={() => navigate("/gigs/new")}>
          New gig
        </button>
      </div>
      <ErrorBanner message={error} />
      {gigs.length === 0 ? (
        <EmptyState
          title="No gigs yet"
          message="Publish a service and it will appear in this list."
          actionLabel="New gig"
          onAction={() => navigate("/gigs/new")}
        />
      ) : (
        <div className="hh-list">
          {gigs.map((gig) => (
            <article key={gig.id} className="hh-panel hh-row">
              <div className="hh-row-top">
                <div>
                  <span className="hh-pill">{gig.category}</span>
                  <h2>{gig.title}</h2>
                </div>
                <span className="hh-price">{formatPrice(gig.price)}</span>
              </div>
              <div className="hh-row-actions">
                <button type="button" className="hh-btn-secondary hh-btn" onClick={() => navigate(`/gigs/${gig.id}/edit`)}>
                  Edit
                </button>
                <button type="button" className="hh-btn hh-btn-danger" onClick={() => handleDelete(gig.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
