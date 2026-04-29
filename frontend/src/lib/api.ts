import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flight API endpoints
export const flightAPI = {
  getLiveFlights: async () => {
    try {
      const response = await api.get('/flights/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching live flights:', error);
      throw error;
    }
  },

  // Get all flights
  getAllFlights: async (skip: number = 0, limit: number = 100) => {
    try {
      const response = await api.get('/flights', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw error;
    }
  },

  // Get active flights only
  getActiveFlights: async () => {
    try {
      const response = await api.get('/flights/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active flights:', error);
      throw error;
    }
  },

  // Get specific flight
  getFlightById: async (id: number | string) => {
    try {
      const response = await api.get(`/flights/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flight ${id}:`, error);
      throw error;
    }
  },

  // Create new flight
  createFlight: async (flightData: any) => {
    try {
      const response = await api.post('/flights', flightData);
      return response.data;
    } catch (error) {
      console.error('Error creating flight:', error);
      throw error;
    }
  },

  // Update flight
  updateFlight: async (id: number | string, flightData: any) => {
    try {
      const response = await api.put(`/flights/${id}`, flightData);
      return response.data;
    } catch (error) {
      console.error(`Error updating flight ${id}:`, error);
      throw error;
    }
  },

  // Delete flight
  deleteFlight: async (id: number | string) => {
    try {
      const response = await api.delete(`/flights/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting flight ${id}:`, error);
      throw error;
    }
  },

  // Get flights by status
  getFlightsByStatus: async (status: string) => {
    try {
      const response = await api.get(`/flights/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flights with status ${status}:`, error);
      throw error;
    }
  },

  // Get delay prediction
  getDelayPrediction: async (id: number | string) => {
    try {
      const response = await api.get(`/delay-prediction/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting delay prediction for ${id}:`, error);
      throw error;
    }
  },

  // Get all delay predictions
  getAllDelayPredictions: async () => {
    try {
      const response = await api.get('/delay-predictions');
      return response.data;
    } catch (error) {
      console.error('Error fetching delay predictions:', error);
      throw error;
    }
  },

  // Get analytics summary
  getAnalyticsSummary: async () => {
    try {
      const response = await api.get('/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

export default api;
