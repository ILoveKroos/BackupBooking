import api from './api';

const serviceService = {
  // Lấy tất cả dịch vụ
  getAllServices: () => {
    return api.get('/services');
  },

  // Lấy dịch vụ theo ID
  getServiceById: (id) => {
    return api.get(`/services/${id}`);
  },

  // Tạo dịch vụ (admin)
  createService: (name, description, price, duration) => {
    return api.post('/services', {
      name,
      description,
      price,
      duration
    });
  },

  // Cập nhật dịch vụ (admin)
  updateService: (id, name, description, price, duration, status) => {
    return api.put(`/services/${id}`, {
      name,
      description,
      price,
      duration,
      status
    });
  },

  // Xóa dịch vụ (admin)
  deleteService: (id) => {
    return api.delete(`/services/${id}`);
  }
};

export default serviceService;
