// Product photos are Unsplash originals requested at 800px; ask the CDN for the size
// actually displayed and a modern format instead.
export const productImage = (src, width) => {
  if (!src || !src.includes("images.unsplash.com")) return src;
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "70");
    url.searchParams.set("auto", "format");
    return url.toString();
  } catch {
    return src;
  }
};
