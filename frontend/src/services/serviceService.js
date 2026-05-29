import api from './api';

const serviceService = {
  getAllServices: () => api.get('/services'),

  getTrendingServices: () => api.get('/services/trending'),

  getAdminServices: () => api.get('/services/admin/all'),

  getServiceById: (id) => api.get(`/services/${id}`),

  getRecommendations: (serviceId, limit = 4) =>
    api.get('/services/recommendations', { params: { serviceId, limit } }),

  createService: (payload) => api.post('/services', payload),

  updateService: (id, payload) => api.put(`/services/${id}`, payload),

  updateServicePrice: (id, price) => api.put(`/services/${id}/price`, { price }),

  deleteService: (id) => api.delete(`/services/${id}`),

  createCategory: (categoryData) => api.post('/services/categories', categoryData),
  
  getAllCategories: () => api.get('/services/categories')
};

export default serviceService;
