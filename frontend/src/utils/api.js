import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup/', data),
  login: (data) => api.post('/api/auth/login/', data),
  validate: () => api.get('/api/auth/validate/'),
  googleMock: (data) => api.post('/api/auth/google/mock/', data),
}

export const flightAPI = {
  search: (params) => api.get('/api/flights/search', { params }),
  getDetails: (flightId) => api.get(`/api/flights/${flightId}`),
  checkSeats: (flightId) => api.get(`/api/flights/${flightId}/seats`),
}

export const bookingAPI = {
  create: (data) => api.post('/api/bookings/', data),
  getMyBookings: () => api.get('/api/bookings/my/'),
  cancel: (bookingId) => api.post(`/api/bookings/${bookingId}/cancel/`),
  getDetails: (bookingId) => api.get(`/api/bookings/${bookingId}/`),
}

export const paymentAPI = {
  process: (data) => api.post('/api/payments/', data),
  createOrder: (bookingId, amount) => api.post('/api/bookings/payments/create-order/', { booking_id: bookingId, amount }),
  status: (paymentId) => api.get(`/api/payments/${paymentId}/`),
}

export default api
