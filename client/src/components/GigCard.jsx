import { formatPrice } from "../format";

export default function GigCard({ title, category, price, onView }) {
  return (
    <article className="hh-card">
      <div className="hh-card-top">
        <span className="hh-pill">{category}</span>
        <span className="hh-price">{formatPrice(price)}</span>
      </div>
      <h2>{title}</h2>
      <div className="hh-card-actions">
        <button type="button" className="hh-btn" onClick={onView}>
          View
        </button>
      </div>
    </article>
  );
}
