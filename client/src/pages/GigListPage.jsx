import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GigCard from "../components/GigCard";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { listGigs } from "../api";

export default function GigListPage() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    listGigs()
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

  if (loading) return <Spinner label="Loading gigs" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Marketplace</p>
          <h1>Browse gigs</h1>
          <p className="hh-lead">Open a card to read the brief and book. Prices are in South African rand.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      {gigs.length === 0 ? (
        <EmptyState title="No gigs yet" message="When freelancers list a service, it will show up here." />
      ) : (
        <div className="hh-grid">
          {gigs.map((gig) => (
            <GigCard
              key={gig.id}
              title={gig.title}
              category={gig.category}
              price={gig.price}
              onView={() => navigate(`/gigs/${gig.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
