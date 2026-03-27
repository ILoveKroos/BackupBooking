import React, { useEffect, useState } from 'react';
import bookingService from '../services/bookingService';
import './MyAppointments.css';

const getStatusBadge = (status) => {
  const statusMap = {
    pending: { label: 'Chờ xác nhận', class: 'badge-warning' },
    confirmed: { label: 'Đã xác nhận', class: 'badge-success' },
    completed: { label: 'Hoàn thành', class: 'badge-info' },
    cancelled: { label: 'Đã hủy', class: 'badge-danger' }
  };
  return statusMap[status] || { label: status, class: 'badge-default' };
};

const hasRated = (appointment) => Number(appointment?.staff_rating) >= 1;

const canReview = (appointment) =>
  appointment?.status === 'completed' && !!appointment?.staff_name && !hasRated(appointment);

const renderRatingStars = (rating) => {
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 0));
  return '★★★★★'.slice(0, safeRating) + '☆☆☆☆☆'.slice(0, 5 - safeRating);
};

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      const nextAppointments = response.data.data || [];
      setAppointments(nextAppointments);
      setReviewDrafts((prev) => {
        const next = { ...prev };
        nextAppointments.forEach((appointment) => {
          if (!next[appointment.id]) {
            next[appointment.id] = { rating: '5', review: '' };
          }
        });
        return next;
      });
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

  const handleReviewInput = (appointmentId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [appointmentId]: {
        ...(prev[appointmentId] || { rating: '5', review: '' }),
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (appointment) => {
    const draft = reviewDrafts[appointment.id] || { rating: '5', review: '' };
    const rating = Number(draft.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      alert('Điểm đánh giá phải từ 1 đến 5.');
      return;
    }

    try {
      setSubmittingReviewId(appointment.id);
      await bookingService.reviewBooking(appointment.id, rating, (draft.review || '').trim());

      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                staff_rating: rating,
                staff_review: (draft.review || '').trim(),
                reviewed_at: new Date().toISOString()
              }
            : item
        )
      );

      setReviewDrafts((prev) => ({
        ...prev,
        [appointment.id]: { rating: '5', review: '' }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi đánh giá thất bại.');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

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
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusBadge(appointment.status);
            const draft = reviewDrafts[appointment.id] || { rating: '5', review: '' };

            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{appointment.service_name}</h3>
                  <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                </div>

                <div className="appointment-body">
                  <div className="appointment-info">
                    <div className="info-row">
                      <span className="label">Ngày hẹn:</span>
                      <span className="value">
                        {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Giờ hẹn:</span>
                      <span className="value">{appointment.appointment_time}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Nhân viên:</span>
                      <span className="value">{appointment.staff_name || 'Chưa phân công'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Thời gian:</span>
                      <span className="value">{appointment.duration} phút</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Giá:</span>
                      <span className="value">
                        {Number(appointment.service_price || 0).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="notes">
                      <strong>Ghi chú:</strong> {appointment.notes}
                    </div>
                  )}

                  {hasRated(appointment) && (
                    <div className="review-result">
                      <div className="review-result-head">
                        <strong>Đánh giá nhân viên</strong>
                        <span className="review-stars">{renderRatingStars(appointment.staff_rating)}</span>
                      </div>
                      {appointment.staff_review ? <p>{appointment.staff_review}</p> : null}
                    </div>
                  )}

                  {canReview(appointment) && (
                    <div className="review-form">
                      <h4>Đánh giá nhân viên sau khi hoàn thành</h4>
                      <div className="review-row">
                        <label htmlFor={`rating-${appointment.id}`}>Điểm</label>
                        <select
                          id={`rating-${appointment.id}`}
                          value={draft.rating}
                          onChange={(event) =>
                            handleReviewInput(appointment.id, 'rating', event.target.value)
                          }
                        >
                          <option value="5">5 - Rất hài lòng</option>
                          <option value="4">4 - Hài lòng</option>
                          <option value="3">3 - Bình thường</option>
                          <option value="2">2 - Chưa tốt</option>
                          <option value="1">1 - Cần cải thiện</option>
                        </select>
                      </div>
                      <textarea
                        rows="3"
                        value={draft.review}
                        onChange={(event) =>
                          handleReviewInput(appointment.id, 'review', event.target.value)
                        }
                        placeholder="Bạn có thể ghi nhận xét chi tiết (không bắt buộc)..."
                      />
                      <button
                        type="button"
                        className="btn-primary review-submit-btn"
                        disabled={submittingReviewId === appointment.id}
                        onClick={() => handleSubmitReview(appointment)}
                      >
                        {submittingReviewId === appointment.id ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  )}
                </div>

                {appointment.status === 'pending' && (
                  <div className="appointment-footer">
                    <button onClick={() => handleCancel(appointment.id)} className="btn-danger">
                      Hủy lịch
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
