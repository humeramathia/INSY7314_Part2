export default function EmptyState({ title = "Nothing here yet", message, actionLabel, onAction }) {
  return (
    <div className="hh-empty">
      <div className="hh-empty-mark" aria-hidden="true">
        +
      </div>
      <h2>{title}</h2>
      {message ? <p className="hh-muted">{message}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="hh-btn" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
