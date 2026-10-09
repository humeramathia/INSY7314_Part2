import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice, formatDate } from "../format";
import { confirmBooking, listGigs, myBookings } from "../api";
import { useAuth } from "../AuthContext";

export default function BookingsPage() {
  const { user } = useAuth();
  const role = user?.role || "client";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const [rows, gigs] = await Promise.all([myBookings(), listGigs()]);
    const titles = new Map((gigs || []).map((gig) => [gig.id, gig.title]));
    return (rows || []).map((booking) => ({
      ...booking,
      gigTitle: titles.get(booking.gigId) || "Gig",
    }));
  }

  useEffect(() => {
    let live = true;
    load()
      .then((rows) => {
        if (live) setBookings(rows);
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

  async function handleConfirm(id) {
    setError("");
    try {
      await confirmBooking(id);
      setBookings(await load());
    } catch (err) {
      setError(err.message);
    }
  }

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
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" message="When a client books a gig, it will land here." />
      ) : (
        <div className="hh-list">
          {bookings.map((booking) => (
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
                  <button type="button" className="hh-btn" onClick={() => handleConfirm(booking.id)}>
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
