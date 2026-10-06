import {
  Smartphone,
  Laptop,
  Gamepad2,
  Home,
  Headphones,
  Tablet,
  Monitor,
  Watch,
  Cable,
  Glasses,
} from "lucide-react";

// The store's categories. `name` is the category name stored on products;
// `key` is its translation key under `categories.` and `home.category_descriptions.`.
export const STORE_CATEGORIES = [
  { name: "Smartphones", key: "smartphones", icon: Smartphone, gradient: "from-blue-500 to-purple-600" },
  { name: "Laptops", key: "laptops", icon: Laptop, gradient: "from-purple-500 to-pink-600" },
  { name: "Gaming", key: "gaming", icon: Gamepad2, gradient: "from-green-500 to-emerald-600" },
  { name: "Smart Home", key: "smart_home", icon: Home, gradient: "from-orange-500 to-red-600" },
  { name: "Audio", key: "audio", icon: Headphones, gradient: "from-pink-500 to-rose-600" },
  { name: "Tablets", key: "tablets", icon: Tablet, gradient: "from-indigo-500 to-blue-600" },
  { name: "Monitors", key: "monitors", icon: Monitor, gradient: "from-sky-500 to-cyan-600" },
  { name: "Wearables", key: "wearables", icon: Watch, gradient: "from-teal-500 to-green-600" },
  { name: "Accessories", key: "accessories", icon: Cable, gradient: "from-slate-500 to-gray-700" },
  { name: "Eyewear", key: "eyewear", icon: Glasses, gradient: "from-amber-500 to-orange-600" },
];

const normalize = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "-");

export const findStoreCategory = (name) =>
  STORE_CATEGORIES.find((category) => normalize(category.name) === normalize(name));

// Translated label for a category name stored on a product; unknown names are shown as stored.
export const categoryLabel = (t, name) => {
  const category = findStoreCategory(name);
  return category ? t(`categories.${category.key}`) : name;
};

export const categorySlug = (name) => normalize(name);
