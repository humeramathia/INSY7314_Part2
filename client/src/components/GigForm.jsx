import { useEffect, useState } from "react";
import ErrorBanner from "./ErrorBanner";

const EMPTY = {
  title: "",
  description: "",
  category: "",
  price: "",
};

export default function GigForm({ initialValues, onSubmit, error, loading, submitLabel = "Save gig" }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });

  useEffect(() => {
    if (!initialValues) return;
    setValues({ ...EMPTY, ...initialValues });
  }, [
    initialValues?.title,
    initialValues?.description,
    initialValues?.category,
    initialValues?.price,
  ]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({
      title: values.title,
      description: values.description,
      category: values.category,
      price: values.price === "" ? "" : Number(values.price),
    });
  }

  return (
    <form className="hh-form hh-panel hh-form-panel" onSubmit={handleSubmit}>
      <ErrorBanner message={error} />
      <label className="hh-field">
        <span>Title</span>
        <input
          name="title"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Description</span>
        <textarea
          name="description"
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Category</span>
        <input
          name="category"
          value={values.category}
          onChange={(event) => update("category", event.target.value)}
          required
        />
      </label>
      <label className="hh-field">
        <span>Price (R)</span>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(event) => update("price", event.target.value)}
          required
        />
      </label>
      <button type="submit" className="hh-btn" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
