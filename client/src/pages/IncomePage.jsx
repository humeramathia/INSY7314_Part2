import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice, formatDate } from "../format";
import { listGigs, myTransactions } from "../api";

export default function IncomePage() {
  const [items, setItems] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([myTransactions(), listGigs()])
      .then(([data, gigs]) => {
        if (!live) return;
        const titles = new Map((gigs || []).map((gig) => [gig.id, gig.title]));
        const rows = (data?.items || []).map((row) => ({
          ...row,
          gigTitle: titles.get(row.gigId) || row.gigTitle || "Booking",
        }));
        setItems(rows);
        setTotalIncome(data?.totalIncome || 0);
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

  if (loading) return <Spinner label="Loading income" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>Income</h1>
          <p className="hh-lead">Confirmed bookings only. This total belongs to the signed-in freelancer.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <div className="hh-panel hh-income-hero">
        <p className="hh-kicker">Total income</p>
        <div className="hh-price">{formatPrice(totalIncome)}</div>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No payments yet" message="When a client confirms a booking, the amount appears here." />
      ) : (
        <div className="hh-list">
          {items.map((row) => (
            <article key={row.id} className="hh-panel hh-row">
              <div className="hh-row-top">
                <div>
                  <h2>{row.gigTitle || "Booking"}</h2>
                  <p className="hh-muted">{formatDate(row.createdAt)}</p>
                </div>
                <span className="hh-price">{formatPrice(row.amount)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
