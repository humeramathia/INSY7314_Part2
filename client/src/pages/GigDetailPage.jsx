import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { formatPrice } from "../format";
import { createBooking, getGig } from "../api";
import { useAuth } from "../AuthContext";

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canBook = user?.role === "client";

  useEffect(() => {
    let live = true;
    setLoading(true);
    getGig(id)
      .then((data) => {
        if (live) setGig(data);
      })
      .catch((err) => {
        if (live) {
          setGig(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id]);

  async function handleBook() {
    setError("");
    try {
      const created = await createBooking(gig.id);
      setBooking(created);
      navigate("/bookings");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Spinner label="Loading gig" />;
  if (!gig) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyState title="Gig not found" message="This listing may have been removed." />
      </>
    );
  }

  return (
    <section className="hh-detail">
      <article className="hh-panel hh-detail-hero">
        <p className="hh-kicker">{gig.category}</p>
        <h1>{gig.title}</h1>
        <div className="hh-detail-meta">
          <span className="hh-price">{formatPrice(gig.price)}</span>
          {gig.freelancerName ? <span className="hh-muted">Listed by {gig.freelancerName}</span> : null}
        </div>
        <p>{gig.description}</p>
      </article>
      <aside className="hh-panel hh-aside">
        <h2>Book this gig</h2>
        <p className="hh-muted">Simulated payment. Confirming later creates an income record for the freelancer.</p>
        <ErrorBanner message={error} />
        {booking ? (
          <p className="hh-muted">Booking {booking.status}.</p>
        ) : canBook ? (
          <button type="button" className="hh-btn" onClick={handleBook}>
            Book
          </button>
        ) : (
          <p className="hh-muted">Sign in as a client to book.</p>
        )}
      </aside>
    </section>
  );
}
