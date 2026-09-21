import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice, formatDate } from "../format";
import { SAMPLE_BOOKINGS } from "../sampleData";

export default function BookingsPage({ bookings, role = "client", onConfirm, loading, error }) {
  const items = bookings ?? SAMPLE_BOOKINGS;

  if (loading) return <Spinner label="Loading bookings" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">{role === "freelancer" ? "Freelancer" : "Client"}</p>
          <h1>My bookings</h1>
          <p className="hh-lead">
            {role === "freelancer"
              ? "Work booked against your gigs. Income appears after the client confirms payment."
              : "Confirm simulated payment to lock in the booking and pay the freelancer on paper."}
          </p>
        </div>
      </div>
      <ErrorBanner message={error} />
      {items.length === 0 ? (
        <EmptyState title="No bookings yet" message="When a client books a gig, it will land here." />
      ) : (
        <div className="hh-list">
          {items.map((booking) => (
            <article key={booking.id} className="hh-panel hh-row">
              <div className="hh-row-top">
                <div>
                  <h2>{booking.gigTitle}</h2>
                  <p className="hh-muted">{formatDate(booking.createdAt)}</p>
                </div>
                <span className={`hh-pill ${booking.status === "confirmed" ? "is-confirmed" : "is-pending"}`}>
                  {booking.status}
                </span>
              </div>
              <div className="hh-row-top">
                <span className="hh-price">{formatPrice(booking.amount)}</span>
                {role === "client" && booking.status === "pending" ? (
                  <button type="button" className="hh-btn" onClick={() => onConfirm?.(booking.id)}>
                    Confirm payment
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
