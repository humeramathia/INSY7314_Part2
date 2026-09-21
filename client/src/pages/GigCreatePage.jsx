import GigForm from "../components/GigForm";

export default function GigCreatePage({ onSubmit, error, loading }) {
  return (
    <section>
      <div className="hh-page-head">
        <div>
          <p className="hh-kicker">Freelancer</p>
          <h1>New gig</h1>
          <p className="hh-lead">Describe the service, set a category, and name your price. The listing is tied to your account.</p>
        </div>
      </div>
      <GigForm onSubmit={onSubmit} error={error} loading={loading} submitLabel="Publish gig" />
    </section>
  );
}
