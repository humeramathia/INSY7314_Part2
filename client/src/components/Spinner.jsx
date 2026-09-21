export default function Spinner({ label = "Loading" }) {
  return (
    <div className="hh-spinner" role="status" aria-live="polite">
      <div className="hh-spinner-ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
