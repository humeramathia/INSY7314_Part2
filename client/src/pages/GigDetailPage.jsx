import { useParams } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { formatPrice } from "../format";
import { SAMPLE_GIGS } from "../sampleData";

export default function GigDetailPage({ gig, onBook, canBook = true, loading, error, booking }) {
  const { id } = useParams();
  const shown = gig ?? SAMPLE_GIGS.find((item) => item.id === id) ?? SAMPLE_GIGS[0];

  if (loading) return <Spinner label="Loading gig" />;
  if (!shown) {
    return <EmptyState title="Gig not found" message="This listing may have been removed." />;
  }

  return (
    <section className="hh-detail">
      <article className="hh-panel hh-detail-hero">
        <p className="hh-kicker">{shown.category}</p>
        <h1>{shown.title}</h1>
        <div className="hh-detail-meta">
          <span className="hh-price">{formatPrice(shown.price)}</span>
          {shown.freelancerName ? (
            <span className="hh-muted">Listed by {shown.freelancerName}</span>
          ) : null}
        </div>
        <p>{shown.description}</p>
      </article>
      <aside className="hh-panel hh-aside">
        <h2>Book this gig</h2>
        <p className="hh-muted">Simulated payment. Confirming later creates an income record for the freelancer.</p>
        <ErrorBanner message={error} />
        {booking ? (
          <p className="hh-muted">Booking {booking.status}.</p>
        ) : canBook ? (
          <button type="button" className="hh-btn" onClick={() => onBook?.(shown.id)}>
            Book
          </button>
        ) : (
          <p className="hh-muted">Sign in as a client to book.</p>
        )}
      </aside>
    </section>
  );
}
