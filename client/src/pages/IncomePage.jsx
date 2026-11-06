import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { formatPrice, formatDate } from "../format";
import { listGigs, myTransactions } from "../api";

function monthLabel(value) {
  const [year, month] = String(value).split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return date.toLocaleDateString("en-ZA", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function IncomePage() {
  const [items, setItems] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [tax, setTax] = useState(null);
  const [byMonth, setByMonth] = useState([]);
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
        setTax(data?.tax || null);
        setByMonth(data?.byMonth || []);
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

  const maxMonth = Math.max(1, ...byMonth.map((row) => row.amount));
  const taxShare = totalIncome > 0 ? Math.round(((tax?.estimatedTax || 0) / totalIncome) * 360) : 0;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>Income</h1>
          <p className="hh-lead">
            Confirmed bookings only. Tax is an estimate using SARS {tax?.taxYear || "2025/26"} individual
            brackets, minus the primary rebate.
          </p>
        </div>
      </div>
      <ErrorBanner message={error} />
      <div className="hh-income-grid">
        <div className="hh-panel hh-income-hero">
          <p className="hh-kicker">Total income</p>
          <div className="hh-price">{formatPrice(totalIncome)}</div>
        </div>
        <div className="hh-panel hh-income-hero">
          <p className="hh-kicker">Estimated tax</p>
          <div className="hh-price">{formatPrice(tax?.estimatedTax || 0)}</div>
        </div>
        <div className="hh-panel hh-income-hero">
          <p className="hh-kicker">After tax</p>
          <div className="hh-price">{formatPrice(tax?.netIncome ?? totalIncome)}</div>
        </div>
      </div>
      {totalIncome > 0 ? (
        <div className="hh-income-visuals">
          <div className="hh-panel">
            <h2>Income vs estimated tax</h2>
            <div
              className="hh-donut"
              style={{ background: `conic-gradient(var(--hh-accent) 0deg ${taxShare}deg, var(--hh-teal) ${taxShare}deg 360deg)` }}
              role="img"
              aria-label={`Estimated tax is ${tax?.effectiveRate || 0} percent of income`}
            />
            <p className="hh-muted">
              Effective rate {tax?.effectiveRate || 0}%. Marginal bracket {tax?.marginalRate || 0}%.
            </p>
          </div>
          <div className="hh-panel">
            <h2>Income by month</h2>
            {byMonth.length === 0 ? (
              <p className="hh-muted">Not enough dated payments to chart yet.</p>
            ) : (
              <ul className="hh-bars">
                {byMonth.map((row) => (
                  <li key={row.month}>
                    <span>{monthLabel(row.month)}</span>
                    <span className="hh-bar-track">
                      <span className="hh-bar-fill" style={{ width: `${(row.amount / maxMonth) * 100}%` }} />
                    </span>
                    <span>{formatPrice(row.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
      {tax ? (
        <div className="hh-panel hh-tax-note">
          <h2>How the estimate is calculated</h2>
          <p>{tax.method}</p>
          <p className="hh-muted">{tax.disclaimer}</p>
        </div>
      ) : null}
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
