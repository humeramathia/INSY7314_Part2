import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice, formatDate } from "../format";
import { SAMPLE_TOTAL_INCOME, SAMPLE_TRANSACTIONS } from "../sampleData";

export default function IncomePage({ items, totalIncome, loading, error }) {
  const rows = items ?? SAMPLE_TRANSACTIONS;
  const total = totalIncome ?? SAMPLE_TOTAL_INCOME;

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
        <div className="hh-price">{formatPrice(total)}</div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No payments yet" message="When a client confirms a booking, the amount appears here." />
      ) : (
        <div className="hh-list">
          {rows.map((row) => (
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
