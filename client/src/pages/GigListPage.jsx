import { useNavigate } from "react-router-dom";
import GigCard from "../components/GigCard";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { SAMPLE_GIGS } from "../sampleData";

export default function GigListPage({ gigs, loading, error }) {
  const navigate = useNavigate();
  const items = gigs ?? SAMPLE_GIGS;

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
      {items.length === 0 ? (
        <EmptyState title="No gigs yet" message="When freelancers list a service, it will show up here." />
      ) : (
        <div className="hh-grid">
          {items.map((gig) => (
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
