import axios from "axios";

const API_URL = "http://localhost:8081/api/reservations";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 OPTIONAL: attach JWT if you want secured access
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b20iLCJpYXQiOjE3NjcxMDE4ODEsImV4cCI6MTc2NzEwNTQ4MX0.rwvPQCFo7b8uDZxEq92Ny1mEBZRVy8i2omb0npRdhR8}`;
  }
  return config;
});

export const getReservations = (page, size, search) =>
  api.get(`?page=${page}&size=${size}&search=${search}`);

export const createReservation = (data) =>
  api.post("", data);

export const deleteReservation = (id) =>
  api.delete(`/${id}`);

export const getByCustomer = (customerId) =>
  api.get(`/customer/${customerId}`);

export const getByBook = (bookId) =>
  api.get(`/book/${bookId}`);
