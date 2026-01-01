// src/services/ReservationService.js
import axios from "axios";

const API_URL = "http://localhost:8081/api/reservations";

export const getReservations = () => axios.get(API_URL);

export const getReservationById = (id) => axios.get(`${API_URL}/${id}`);

export const createReservation = (reservation) => axios.post(API_URL, reservation);

export const updateReservation = (id, reservation) => axios.put(`${API_URL}/${id}`, reservation);

export const deleteReservation = (id) => axios.delete(`${API_URL}/${id}`);
