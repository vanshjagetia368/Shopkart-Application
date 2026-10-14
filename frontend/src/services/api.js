import axios from "axios";

// Base URL — points to Express backend
const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // send HttpOnly cookies on every request
});

// ── Customer / Auth ──────────────────────────────
export const registerCustomer = (data) => API.post("/customers/register", data);
export const loginCustomer    = (data) => API.post("/customers/login", data);
export const getMyProfile     = ()     => API.get("/customers/me");
export const logoutCustomer   = ()     => API.post("/customers/logout");

// ── Products ─────────────────────────────────────
export const getProducts    = (params = {}) => API.get("/products", { params });
export const getProductById = (id)          => API.get(`/products/${id}`);
export const getCategories  = ()            => API.get("/products/categories");
export const createProduct  = (data)        => API.post("/products", data);

// ── Wishlist (Lab-04) ─────────────────────────────
export const getWishlist        = ()          => API.get("/wishlist");
export const getWishlistCount   = ()          => API.get("/wishlist/count");
export const addToWishlist      = (productId) => API.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => API.delete(`/wishlist/${productId}`);
export const toggleWishlist     = (productId) => API.patch(`/wishlist/${productId}/toggle`);

// ── Cart (Lab-05) ────────────────────────────────
export const getCart          = ()                    => API.get("/cart");
export const addToCart        = (productId)           => API.post(`/cart/${productId}`);
export const updateCartItem   = (productId, quantity) => API.patch(`/cart/${productId}`, { quantity });
export const removeFromCart   = (productId)           => API.delete(`/cart/${productId}`);
export const clearCart        = ()                    => API.delete("/cart/clear");

export default API;
