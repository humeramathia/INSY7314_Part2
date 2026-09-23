import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GigCard from "../components/GigCard";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import Spinner from "../components/Spinner";
import { adminGigs } from "../api";

export default function AdminGigsPage() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    adminGigs()
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
      {gigs.length === 0 ? (
        <EmptyState title="No gigs yet" message="The marketplace is empty." />
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
