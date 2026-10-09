export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="hh-banner" role="alert">
      {message}
    </div>
  );
}
