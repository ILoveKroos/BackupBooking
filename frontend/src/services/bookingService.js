import api from './api';

const bookingService = {
  createBooking: (service_id, staff_id, appointment_date, appointment_time, notes) => {
    return api.post('/bookings', {
      service_id,
      staff_id,
      appointment_date,
      appointment_time,
      notes
    });
  },

  getMyBookings: () => {
    return api.get('/bookings/my-bookings');
  },

  getAllBookings: () => {
    return api.get('/bookings');
  },

  getBookingById: (id) => {
    return api.get(`/bookings/${id}`);
  },

  updateBookingStatus: (id, status) => {
    return api.put(`/bookings/${id}/status`, {
      status
    });
  },

  cancelBooking: (id) => {
    return api.put(`/bookings/${id}/cancel`);
  },

  reviewBooking: (id, rating, review) => {
    return api.put(`/bookings/${id}/review`, {
      rating,
      review
    });
  }
};

export default bookingService;
