import React, { useEffect, useState } from 'react';
import bookingService from '../services/bookingService';
import './MyAppointments.css';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setAppointments(response.data.data || []);
    } catch (err) {
      // Không hiển thị banner lỗi cho khách hàng, chỉ fallback về danh sách rỗng.
      setAppointments([]);
      console.error('Không thể tải lịch hẹn:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch này?')) return;

    try {
      await bookingService.cancelBooking(id);
      fetchAppointments();
    } catch (err) {
      alert('Hủy lịch thất bại.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', class: 'badge-warning' },
      confirmed: { label: 'Đã xác nhận', class: 'badge-success' },
      completed: { label: 'Hoàn thành', class: 'badge-info' },
      cancelled: { label: 'Đã hủy', class: 'badge-danger' }
    };
    return statusMap[status] || { label: status, class: 'badge-default' };
  };

  if (loading) {
    return <div className="loading">Đang tải lịch hẹn...</div>;
  }

  return (
    <div className="appointments-page">
      <h1>Lịch hẹn của tôi</h1>

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

      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>Không có lịch hẹn nào.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((apt) => {
            const statusInfo = getStatusBadge(apt.status);

            return (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{apt.service_name}</h3>
                  <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                </div>

                <div className="appointment-body">
                  <div className="appointment-info">
                    <div className="info-row">
                      <span className="label">Ngày hẹn:</span>
                      <span className="value">
                        {new Date(apt.appointment_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Giờ hẹn:</span>
                      <span className="value">{apt.appointment_time}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Nhân viên:</span>
                      <span className="value">{apt.staff_name || 'Chưa phân công'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Thời gian:</span>
                      <span className="value">{apt.duration} phút</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Giá:</span>
                      <span className="value">{Number(apt.service_price || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="notes">
                      <strong>Ghi chú:</strong> {apt.notes}
                    </div>
                  )}
                </div>

                <div className="appointment-footer">
                  {apt.status === 'pending' && (
                    <button onClick={() => handleCancel(apt.id)} className="btn-danger">
                      Hủy lịch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
