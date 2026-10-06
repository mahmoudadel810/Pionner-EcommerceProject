import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import API_CONFIG, { buildApiUrl } from "../config/api.js";
import { getTranslation } from "../utils/i18nUtils.js";

// Catalogue lists are reused across pages for this long before being refetched in the background.
const FRESH_FOR_MS = 60 * 1000;
const PAGE_SIZE = 50;

const isFresh = (fetchedAt) => Date.now() - fetchedAt < FRESH_FOR_MS;

let allProductsRequest = null;
let featuredRequest = null;

const fetchProductsPage = async (page) => {
  const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL) + `?limit=${PAGE_SIZE}&page=${page}`);
  if (!response.data?.success) throw new Error("Failed to fetch products");
  return response.data;
};

export const useProductStore = create((set, get) => ({
  products: [],
  productsFetchedAt: 0,
  featured: [],
  featuredFetchedAt: 0,
  loading: false,
  error: null,

  setProducts: products => set({ products }),

  createProduct: async productData => {
    set({ loading: true, error: null });
    try {
     
      
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE), productData);
      if (response.data) {
        set(prevState => ({
          products: [...prevState.products, response.data],
          loading: false,
        }));
        toast.success(getTranslation('product.created', 'Product created successfully'));
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to create product");
      }
    } catch {
      const errorMessage = getTranslation('product.errors.createFailed', 'Failed to create product');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Returns the cached catalogue while it is fresh; otherwise refetches, keeping the cached
  // list on screen (no spinner) until the new one arrives. `force` skips the cache.
  fetchAllProducts: async ({ force = false } = {}) => {
    const { products, productsFetchedAt } = get();
    if (!force && products.length > 0 && isFresh(productsFetchedAt)) {
      return { success: true, data: products };
    }
    if (allProductsRequest) return allProductsRequest;

    set({ loading: products.length === 0, error: null });
    allProductsRequest = (async () => {
      try {
        // The API caps a page at 50 items; fetch the remaining pages in parallel.
        const first = await fetchProductsPage(1);
        const totalPages = first.pagination?.totalPages || 1;
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => fetchProductsPage(i + 2))
        );
        const all = [first, ...rest].flatMap((page) => page.data || []);
        set({ products: all, productsFetchedAt: Date.now(), loading: false });
        return { success: true, data: all };
      } catch {
        const errorMessage = getTranslation('product.errors.fetchFailed', 'Failed to fetch products');
        if (get().products.length === 0) toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
        return { success: false, message: errorMessage };
      } finally {
        allProductsRequest = null;
      }
    })();
    return allProductsRequest;
  },

  // Leaves the cached catalogue untouched; callers keep the result themselves.
  fetchProductsByCategory: async category => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_CATEGORY(category)));
      return { success: true, data: response.data?.success ? response.data.data : [] };
    } catch {
      return { success: false, message: getTranslation('product.errors.fetchFailed', 'Failed to fetch products') };
    }
  },

  deleteProduct: async productId => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(productId)));
      if (response.data) {
        set(prevProducts => ({
          products: prevProducts.products.filter(
            product => product._id !== productId
          ),
          loading: false,
        }));
        toast.success(getTranslation('product.deleted', 'Product deleted successfully'));
        return { success: true };
      } else {
        throw new Error("Failed to delete product");
      }
    } catch {
      const errorMessage = getTranslation('product.errors.deleteFailed', 'Failed to delete product');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  toggleFeaturedProduct: async productId => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.TOGGLE_FEATURED(productId)));
      if (response.data) {
        set(prevProducts => ({
          products: prevProducts.products.map(product =>
            product._id === productId
              ? { ...product, isFeatured: response.data.isFeatured }
              : product
          ),
          loading: false,
        }));
        toast.success(getTranslation('product.updated', 'Product updated successfully'));
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to update product");
      }
    } catch {
      const errorMessage = getTranslation('product.errors.updateFailed', 'Failed to update product');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  fetchFeaturedProducts: async ({ force = false } = {}) => {
    const { featured, featuredFetchedAt } = get();
    if (!force && featuredFetchedAt && isFresh(featuredFetchedAt)) {
      return { success: true, data: featured };
    }
    if (featuredRequest) return featuredRequest;

    featuredRequest = (async () => {
      try {
        const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_FEATURED));
        const data = response.data?.success ? response.data.data || [] : [];
        set({ featured: data, featuredFetchedAt: Date.now() });
        return { success: true, data };
      } catch {
        const errorMessage = getTranslation('product.errors.fetchFeaturedFailed', 'Failed to fetch featured products');
        if (!get().featuredFetchedAt) toast.error(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        featuredRequest = null;
      }
    })();
    return featuredRequest;
  },
}));
