import { useParams } from "react-router-dom";
import GigForm from "../components/GigForm";
import Spinner from "../components/Spinner";
import { SAMPLE_GIGS } from "../sampleData";

export default function GigEditPage({ initialValues, onSubmit, error, loading }) {
  const { id } = useParams();
  const sample = SAMPLE_GIGS.find((gig) => gig.id === id) ?? SAMPLE_GIGS[0];
  const values = initialValues ?? {
    title: sample.title,
    description: sample.description,
    category: sample.category,
    price: sample.price,
  };

  if (loading && !values.title) return <Spinner label="Loading gig" />;

  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>Edit gig</h1>
          <p className="hh-lead">Update the listing. Ownership is checked on the server.</p>
        </div>
      </div>
      <GigForm
        initialValues={values}
        onSubmit={onSubmit}
        error={error}
        loading={loading}
        submitLabel="Save changes"
      />
    </section>
  );
}
