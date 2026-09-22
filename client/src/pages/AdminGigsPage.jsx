import { useNavigate } from "react-router-dom";
import GigCard from "../components/GigCard";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { SAMPLE_GIGS } from "../sampleData";

export default function AdminGigsPage({ gigs, loading, error }) {
  const navigate = useNavigate();
  const items = gigs ?? SAMPLE_GIGS;

  if (loading) return <Spinner label="Loading all gigs" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Admin</p>
          <h1>All gigs</h1>
          <p className="hh-lead">Platform view of every listing. Used to show admin access control.</p>
        </div>
      </div>
      <ErrorBanner message={error} />
      {items.length === 0 ? (
        <EmptyState title="No gigs yet" message="The marketplace is empty." />
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
