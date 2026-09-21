import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice } from "../format";
import { SAMPLE_GIGS } from "../sampleData";

export default function MyGigsPage({ gigs, onEdit, onDelete, loading, error }) {
  const navigate = useNavigate();
  const items = gigs ?? SAMPLE_GIGS.filter((gig) => gig.freelancerId === "u-ada");

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
      {items.length === 0 ? (
        <EmptyState
          title="No gigs yet"
          message="Publish a service and it will appear in this list."
          actionLabel="New gig"
          onAction={() => navigate("/gigs/new")}
        />
      ) : (
        <div className="hh-list">
          {items.map((gig) => (
            <article key={gig.id} className="hh-panel hh-row">
              <div className="hh-row-top">
                <div>
                  <span className="hh-pill">{gig.category}</span>
                  <h2>{gig.title}</h2>
                </div>
                <span className="hh-price">{formatPrice(gig.price)}</span>
              </div>
              <div className="hh-row-actions">
                <button type="button" className="hh-btn-secondary hh-btn" onClick={() => onEdit?.(gig.id)}>
                  Edit
                </button>
                <button type="button" className="hh-btn hh-btn-danger" onClick={() => onDelete?.(gig.id)}>
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
