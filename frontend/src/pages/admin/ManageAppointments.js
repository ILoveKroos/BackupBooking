import React, { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import './ManageAppointments.css';

const formatRating = (rating) => {
  const safeRating = Number(rating);
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    return '-';
  }
  return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)} (${safeRating}/5)`;
};

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings();
      setAppointments(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      fetchAppointments();
    } catch (err) {
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-appointments">
      <h1>Quản lý lịch hẹn</h1>

      <div className="filter-buttons">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả ({appointments.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Chờ xác nhận
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Hoàn thành
        </button>
      </div>

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Nhân viên</th>
              <th>Ngày hẹn</th>
              <th>Giờ hẹn</th>
              <th>Trạng thái</th>
              <th>Đánh giá NV</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.customer_name}</td>
                <td>{appointment.service_name}</td>
                <td>{appointment.staff_name || 'Chưa chọn'}</td>
                <td>{new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}</td>
                <td>{appointment.appointment_time}</td>
                <td>
                  <select
                    value={appointment.status}
                    onChange={(event) => handleStatusChange(appointment.id, event.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                <td>{formatRating(appointment.staff_rating)}</td>
                <td>
                  <button className="btn-secondary btn-small">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageAppointments;
