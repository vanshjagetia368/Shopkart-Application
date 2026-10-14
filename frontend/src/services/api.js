import axios from "axios";

// Base URL — points to Express backend
const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // send HttpOnly cookies on every request
});

// ── Customer / Auth ──────────────────────────────
export const registerCustomer = (data) => API.post("/customers/register", data);
export const loginCustomer = (data) => API.post("/customers/login", data);
export const getMyProfile = () => API.get("/customers/me");
export const logoutCustomer = () => API.post("/customers/logout");

// ── Products ─────────────────────────────────────
export const getProducts = (params = {}) => API.get("/products", { params });
export const getProductById = (id) => API.get(`/products/${id}`);
export const getCategories = () => API.get("/products/categories");
export const createProduct = (data) => API.post("/products", data);

export default API;
