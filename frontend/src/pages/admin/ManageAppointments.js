import React, { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import './ManageAppointments.css';

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-appointments">
      <h1>Quản lý lịch hẹn</h1>

      {error && <div className="alert alert-error">{error}</div>}

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
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((apt) => (
              <tr key={apt.id}>
                <td>{apt.id}</td>
                <td>{apt.customer_name}</td>
                <td>{apt.service_name}</td>
                <td>{apt.staff_name || 'Chưa chọn'}</td>
                <td>{new Date(apt.appointment_date).toLocaleDateString('vi-VN')}</td>
                <td>{apt.appointment_time}</td>
                <td>
                  <select
                    value={apt.status}
                    onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
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
