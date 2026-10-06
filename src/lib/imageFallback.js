// Inline so the fallback itself can never fail to load and trigger another error.
const PLACEHOLDER_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#e5e7eb"/></svg>'
  );

export const handleImageError = (event) => {
  if (event.currentTarget.src !== PLACEHOLDER_SVG) {
    event.currentTarget.src = PLACEHOLDER_SVG;
  }
};
