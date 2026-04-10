import React, { useEffect, useMemo, useState } from 'react';
import authService from '../../services/authService';
import bookingService from '../../services/bookingService';
import staffService from '../../services/staffService';
import './ServiceStaffDashboard.css';

const formatRating = (rating) => {
  const safeRating = Number(rating);
  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    return '-';
  }
  return `${'\u2605'.repeat(safeRating)}${'\u2606'.repeat(5 - safeRating)} (${safeRating}/5)`;
};

const hasCancellationRequest = (appointment) =>
  Number(appointment?.cancellation_requested) === 1 && appointment?.status !== 'cancelled';

const isAwaitingStaffConfirmation = (appointment) =>
  appointment?.status === 'pending' && !hasCancellationRequest(appointment);

const getDisplayStatus = (appointment) => {
  if (hasCancellationRequest(appointment)) {
    return 'Chờ xác nhận hủy';
  }

  const statusMap = {
    pending: 'Chờ nhân viên xác nhận',
    confirmed: 'Đã xác nhận làm',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };

  return statusMap[appointment?.status] || appointment?.status || 'Không rõ';
};

function ServiceStaffDashboard() {
  const currentUser = authService.getUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setAppointments(response.data.data || []);
      setError('');
    } catch (err) {
      const apiMessage =
        typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
      setError(apiMessage || 'Không thể tải danh sách lịch hẹn.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((item) => isAwaitingStaffConfirmation(item)).length,
      confirmed: appointments.filter((item) => item.status === 'confirmed' && !hasCancellationRequest(item)).length,
      cancellationRequested: appointments.filter((item) => hasCancellationRequest(item)).length,
      completed: appointments.filter((item) => item.status === 'completed').length,
      cancelled: appointments.filter((item) => item.status === 'cancelled').length
    }),
    [appointments]
  );

  const handleStatusChange = async (id, newStatus) => {
    try {
      setProcessingId(id);
      await bookingService.updateBookingStatus(id, newStatus);
      await fetchMyAppointments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptAppointment = async (id) => {
    if (!window.confirm('Xác nhân bân sê nhân và thyc hiên lich hên này?')) {
      return;
    }

    try {
      setProcessingId(id);
      await bookingService.updateBookingStatus(id, 'confirmed');
      await fetchMyAppointments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Không thể xác nhận nhận lịch.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Xác nhân hùy lich hên này?')) {
      return;
    }

    try {
      setProcessingId(id);
      await bookingService.updateBookingStatus(id, 'cancelled');
      await fetchMyAppointments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Không thể hủy lịch hẹn này.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestCancellation = async (id) => {
    if (!window.confirm('Xác nhân gùi yêu câu hùy lich hên này?')) {
      return;
    }

    try {
      setProcessingId(id);
      await bookingService.requestCancelBooking(id);
      await fetchMyAppointments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Gửi yêu cầu hủy thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteService = async (id) => {
    if (!window.confirm('Xác nhân dã hoàn thành dich vu này?')) {
      return;
    }

    try {
      setProcessingId(id);
      await bookingService.updateBookingStatus(id, 'completed');
      await fetchMyAppointments();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Không thể cập nhật trạng thái hoàn thành.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    
    if (!leaveRequest.start_date || !leaveRequest.end_date || !leaveRequest.reason.trim()) {
      window.alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      await staffService.requestLeave(leaveRequest);
      window.alert('Gửi yêu cầu nghỉ phép thành công! Chờ admin xác nhận.');
      setShowLeaveRequestModal(false);
      setLeaveRequest({ start_date: '', end_date: '', reason: '' });
    } catch (err) {
      window.alert(err.response?.data?.message || 'Gửi yêu cầu nghỉ phép thất bại.');
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'all') return true;
    if (filter === 'cancellation_requested') return hasCancellationRequest(appointment);
    if (filter === 'pending') return isAwaitingStaffConfirmation(appointment);
    if (filter === 'confirmed') return appointment.status === 'confirmed' && !hasCancellationRequest(appointment);
    return appointment.status === filter;
  });

  if (loading) {
    return <div className="loading">Ðang tài...</div>;
  }

  return (
    <div className="service-staff-dashboard">
      <div className="dashboard-header">
        <h1>Lịch làm việc - Nhân viên dịch vụ</h1>
        <p className="dashboard-note">
          Chào {currentUser?.name}, đây là giao diện lịch làm việc cá nhân. Bạn có thể xem lịch đã admin sắp xếp, 
          yêu cầu nghỉ phép, yêu cầu hủy lịch và đánh dấu hoàn thành dịch vụ.
        </p>
      </div>

      <div className="action-bar">
        <button 
          className="btn-leave-request" 
          onClick={() => setShowLeaveRequestModal(true)}
        >
          Yêu cầu nghỉ phép
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Tổng lịch</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Chờ xác nhận</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Đã xác nhận</h3>
            <p className="stat-value">{stats.confirmed}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Hoàn thành</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Chờ xác nhận ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận ({stats.confirmed})
        </button>
        <button
          className={`filter-btn ${filter === 'cancellation_requested' ? 'active' : ''}`}
          onClick={() => setFilter('cancellation_requested')}
        >
          Yêu cầu hủy ({stats.cancellationRequested})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Hoàn thành ({stats.completed})
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Đã hủy ({stats.cancelled})
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!error && appointments.length === 0 && (
        <div className="alert alert-info">Chưa có lịch hẹn nào để hiển thị.</div>
      )}

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Ngày hẹn</th>
              <th>Giờ hẹn</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-cell">
                  Không có lịch hẹn phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {filteredAppointments.map((appointment) => {
              const requestPending = hasCancellationRequest(appointment);
              const awaitingStaffConfirmation = isAwaitingStaffConfirmation(appointment);
              const rowClass = requestPending
                ? 'has-cancellation-request'
                : awaitingStaffConfirmation
                  ? 'has-pending-confirmation'
                  : '';

              return (
                <tr key={appointment.id} className={rowClass}>
                  <td>{appointment.id}</td>
                  <td>
                    <div className="cell-stack">
                      <strong>{appointment.customer_name}</strong>
                      <small>{appointment.customer_email || '-'}</small>
                    </div>
                  </td>
                  <td>{appointment.service_name}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    <div className="status-cell">
                      <span
                        className={`status-pill ${
                          requestPending
                            ? 'status-pill-warning'
                            : awaitingStaffConfirmation
                              ? 'status-pill-pending'
                              : ''
                        }`}
                      >
                        {getDisplayStatus(appointment)}
                      </span>
                      {requestPending && (
                        <small className="status-note">Khách đang chờ admin xác nhận hủy.</small>
                      )}
                      {!requestPending && awaitingStaffConfirmation && (
                        <small className="status-note status-note-pending">
                          Khách đã đặt lịch với bạn. Hãy xác nhận nhận lịch hoặc hủy lịch hẹn này.
                        </small>
                      )}
                    </div>
                  </td>
                  <td>{formatRating(appointment.staff_rating)}</td>
                  <td>
                    {requestPending ? (
                      <span className="no-action">Chờ admin xác nhận hủy</span>
                    ) : awaitingStaffConfirmation ? (
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-accept-booking"
                          disabled={processingId === appointment.id}
                          onClick={() => handleAcceptAppointment(appointment.id)}
                        >
                          {processingId === appointment.id ? 'Đang xác nhận...' : 'Xác nhận'}
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-booking"
                          disabled={processingId === appointment.id}
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Hủy lịch
                        </button>
                      </div>
                    ) : appointment.status === 'confirmed' ? (
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-complete-service"
                          disabled={processingId === appointment.id}
                          onClick={() => handleCompleteService(appointment.id)}
                        >
                          {processingId === appointment.id ? 'Đang cập nhật...' : 'Hoàn thành'}
                        </button>
                        <button
                          type="button"
                          className="btn-request-cancel"
                          disabled={processingId === appointment.id}
                          onClick={() => handleRequestCancellation(appointment.id)}
                        >
                          Yêu cầu hủy
                        </button>
                      </div>
                    ) : (
                      <span className="no-action">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showLeaveRequestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Yêu cầu nghỉ phép</h2>
              <button 
                className="modal-close"
                onClick={() => setShowLeaveRequestModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitLeaveRequest} className="modal-body">
              <div className="form-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={leaveRequest.start_date}
                  onChange={(e) => setLeaveRequest({...leaveRequest, start_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={leaveRequest.end_date}
                  onChange={(e) => setLeaveRequest({...leaveRequest, end_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Lý do:</label>
                <textarea
                  value={leaveRequest.reason}
                  onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Gửi yêu cầu
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowLeaveRequestModal(false)}
                >
                  Hùy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceStaffDashboard;
