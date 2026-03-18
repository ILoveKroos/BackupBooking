import api from './api';

const dashboardService = {
  // Lấy tóm tắt dashboard
  getSummary: () => {
    return api.get('/admin/dashboard/summary');
  },

  // Lấy booking theo tháng
  getBookingsByMonth: () => {
    return api.get('/admin/dashboard/bookings-by-month');
  },

  // Lấy dịch vụ phổ biến
  getTopServices: () => {
    return api.get('/admin/dashboard/top-services');
  },

  // Lấy tần suất khách hàng
  getCustomerFrequency: () => {
    return api.get('/admin/dashboard/customer-frequency');
  },

  // Lấy trạng thái appointment
  getAppointmentStatus: () => {
    return api.get('/admin/dashboard/appointment-status');
  },

  // Lấy doanh thu theo tháng
  getRevenueByMonth: () => {
    return api.get('/admin/dashboard/revenue-by-month');
  },

  // Lấy tỷ lệ hủy lịch
  getCancellationRate: () => {
    return api.get('/admin/dashboard/cancellation-rate');
  }
};

export default dashboardService;
