import api from './api';

const staffService = {
  getAllStaff: () => {
    return api.get('/staff');
  },

  getBookableStaff: () => {
    return api.get('/staff/bookable');
  },

  getAvailableStaff: (date, time, serviceId) => {
    const params = new URLSearchParams();
    params.set('date', date);
    params.set('time', time);
    if (serviceId) {
      params.set('serviceId', serviceId);
    }

    return api.get(`/staff/available?${params.toString()}`);
  },

  createStaff: (name, email, password, phone, staff_role_id, is_active = true) => {
    return api.post('/staff', {
      name,
      email,
      password,
      phone,
      staff_role_id,
      is_active
    });
  },

  getAllStaffRoles: () => {
    return api.get('/staff/roles');
  },

  createStaffRole: (role_name) => {
    return api.post('/staff/roles', { role_name });
  },

  updateStaff: (id, payload) => {
    return api.put(`/staff/${id}`, payload);
  },

  getStaffWeeklyAvailability: (id) => {
    return api.get(`/staff/${id}/weekly-availability`);
  },

  replaceStaffWeeklyAvailability: (id, slots) => {
    return api.put(`/staff/${id}/weekly-availability`, { slots });
  },

  requestLeave: (leaveData) => {
    return api.post('/staff/leave-request', leaveData);
  },

  getMyLeaveRequests: () => {
    return api.get('/staff/my-leave-requests');
  }
};

export default staffService;
