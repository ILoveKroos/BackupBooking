import React, { useEffect, useMemo, useState } from 'react';
import VoucherIcon from '../../../components/VoucherIcon';
import customerService from '../../../services/customerService';
import voucherService from '../../../services/voucherService';
import { formatVnd } from '../../../utils/formatters';
import './ManageVouchers.css';

const emptyForm = {
  code: '',
  voucher_type: 'percentage',
  discount_percent: '15',
  discount_amount: '',
  min_order_value: '300000',
  max_discount_amount: '120000',
  customer_type: 'both',
  valid_days: '7',
  max_usage_global: '100',
  description: ''
};

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Chưa có';
  return parsed.toLocaleDateString('vi-VN');
};

const getDiscountText = (voucher) => {
  if (voucher.voucher_type === 'percentage') {
    return `-${Number(voucher.discount_percent || 0)}%`;
  }

  return `-${formatVnd(voucher.discount_amount)}`;
};

function ManageVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [assignByVoucher, setAssignByVoucher] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [activeAssignVoucherId, setActiveAssignVoucherId] = useState(null);
  const [editingVoucherId, setEditingVoucherId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [voucherRes, customerRes, analyticsRes] = await Promise.all([
        voucherService.getAllVouchers(),
        customerService.getAllCustomers(),
        voucherService.getAnalytics()
      ]);

      setVouchers(voucherRes.data?.data || []);
      setCustomers(customerRes.data?.data || []);
      setAnalytics(analyticsRes.data?.data || null);
      setFeedback({ type: '', text: '' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Không thể tải dữ liệu voucher.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeVouchers = useMemo(
    () => vouchers.filter((voucher) => voucher.status === 'active' && new Date(voucher.expiry_date) > new Date()).length,
    [vouchers]
  );

  const updateField = (field, value) => {
    setFeedback({ type: '', text: '' });
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const payload = {
      code: formData.code.trim() || undefined,
      voucher_type: formData.voucher_type,
      min_order_value: Number(formData.min_order_value || 0),
      max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
      customer_type: formData.customer_type,
      valid_days: Number(formData.valid_days || 7),
      max_usage_global: formData.max_usage_global ? Number(formData.max_usage_global) : null,
      description: formData.description.trim()
    };

    if (formData.voucher_type === 'percentage') {
      payload.discount_percent = Number(formData.discount_percent || 0);
      payload.discount_amount = 0;
    } else {
      payload.discount_amount = Number(formData.discount_amount || 0);
      payload.discount_percent = null;
      payload.max_discount_amount = null;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      if (editingVoucherId) {
        await voucherService.updateVoucher(editingVoucherId, buildPayload());
        setFeedback({ type: 'success', text: 'Đã cập nhật voucher.' });
      } else {
        await voucherService.createVoucher(buildPayload());
        setFeedback({ type: 'success', text: 'Đã tạo voucher.' });
      }
      setFormData(emptyForm);
      setEditingVoucherId(null);
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Thao tác thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  const startEditVoucher = (voucher) => {
    setEditingVoucherId(voucher.id);
    setFormData({
      code: voucher.code || '',
      voucher_type: voucher.voucher_type || 'percentage',
      discount_percent: voucher.discount_percent ? String(voucher.discount_percent) : '',
      discount_amount: voucher.discount_amount ? String(voucher.discount_amount) : '',
      min_order_value: voucher.min_order_value ? String(voucher.min_order_value) : '',
      max_discount_amount: voucher.max_discount_amount ? String(voucher.max_discount_amount) : '',
      customer_type: voucher.customer_type || 'both',
      valid_days: voucher.valid_days ? String(voucher.valid_days) : '7',
      max_usage_global: voucher.max_usage_global ? String(voucher.max_usage_global) : '',
      description: voucher.description || ''
    });
    setFeedback({ type: '', text: '' });
  };

  const updateAssignState = (voucherId, patch) => {
    setAssignByVoucher((prev) => ({
      ...prev,
      [voucherId]: {
        customer_id: '',
        send_email: false,
        ...(prev[voucherId] || {}),
        ...patch
      }
    }));
  };

  const handleAssign = async (voucherId) => {
    const state = assignByVoucher[voucherId] || {};
    if (!state.customer_id) {
      setFeedback({ type: 'error', text: 'Vui lòng chọn khách hàng để gán voucher.' });
      return;
    }

    try {
      setSaving(true);
      await voucherService.assignVoucher(voucherId, {
        customer_id: Number(state.customer_id),
        send_email: Boolean(state.send_email)
      });
      setFeedback({ type: 'success', text: 'Đã gán voucher cho khách hàng.' });
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gán voucher thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (voucherId) => {
    try {
      setSaving(true);
      await voucherService.deleteVoucher(voucherId);
      setFeedback({ type: 'success', text: 'Đã tắt voucher.' });
      await fetchData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Không thể tắt voucher.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải voucher...</div>;
  }

  return (
    <div className="manage-vouchers-page">
      <section className="voucher-admin-head">
        <div className="voucher-admin-title">
          <span className="voucher-admin-icon">
            <VoucherIcon className="voucher-admin-icon-svg" />
          </span>
          <div>
            <p>Admin</p>
            <h1>Quản lý voucher</h1>
          </div>
        </div>
        <div className="voucher-admin-stats">
          <span>
            <strong>{vouchers.length}</strong>
            tổng mã
          </span>
          <span>
            <strong>{activeVouchers}</strong>
            đang chạy
          </span>
          <span>
            <strong>{Number(analytics?.summary?.total_usage || 0)}</strong>
            lượt dùng
          </span>
        </div>
      </section>

      {feedback.text && <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>}

      <section className="voucher-admin-layout">
        <form className="voucher-form" onSubmit={handleSubmit}>
          <h2>{editingVoucherId ? 'Cập nhật voucher' : 'Tạo voucher'}</h2>

          <label>
            Mã voucher
            <input
              value={formData.code}
              onChange={(event) => updateField('code', event.target.value)}
              placeholder="Tự tạo nếu bỏ trống"
            />
          </label>

          <label>
            Loại giảm
            <select
              value={formData.voucher_type}
              onChange={(event) => updateField('voucher_type', event.target.value)}
            >
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Số tiền</option>
            </select>
          </label>

          {formData.voucher_type === 'percentage' ? (
            <>
              <label>
                Phần trăm giảm
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(event) => updateField('discount_percent', event.target.value)}
                  required
                />
              </label>
              <label>
                Giảm tối đa
                <input
                  type="number"
                  min="0"
                  value={formData.max_discount_amount}
                  onChange={(event) => updateField('max_discount_amount', event.target.value)}
                />
              </label>
            </>
          ) : (
            <label>
              Số tiền giảm
              <input
                type="number"
                min="1000"
                value={formData.discount_amount}
                onChange={(event) => updateField('discount_amount', event.target.value)}
                required
              />
            </label>
          )}

          <label>
            Đơn tối thiểu
            <input
              type="number"
              min="0"
              value={formData.min_order_value}
              onChange={(event) => updateField('min_order_value', event.target.value)}
            />
          </label>

          <label>
            Nhóm khách
            <select
              value={formData.customer_type}
              onChange={(event) => updateField('customer_type', event.target.value)}
            >
              <option value="both">Tất cả</option>
              <option value="regular">Thành viên thường</option>
              <option value="vip">VIP</option>
              <option value="vvip">VVIP</option>
              <option value="vvvip">VVVIP</option>
            </select>
          </label>

          <label>
            Hạn dùng (ngày)
            <input
              type="number"
              min="1"
              value={formData.valid_days}
              onChange={(event) => updateField('valid_days', event.target.value)}
            />
          </label>

          <label>
            Lượt dùng toàn hệ thống
            <input
              type="number"
              min="1"
              value={formData.max_usage_global}
              onChange={(event) => updateField('max_usage_global', event.target.value)}
            />
          </label>

          <label className="voucher-form-wide">
            Mô tả
            <textarea
              rows="3"
              value={formData.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Ưu đãi dành cho lần đặt lịch tiếp theo"
            />
          </label>

          <div className="voucher-form-actions" style={{ display: 'grid', gridTemplateColumns: editingVoucherId ? '1fr 1fr' : '1fr', gap: '10px' }}>
            <button type="submit" className="voucher-primary-btn" disabled={saving}>
              {saving ? 'Đang lưu...' : editingVoucherId ? 'Cập nhật' : 'Tạo voucher'}
            </button>
            {editingVoucherId && (
              <button
                type="button"
                className="voucher-secondary-btn"
                onClick={() => {
                  setFormData(emptyForm);
                  setEditingVoucherId(null);
                }}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>

        <section className="voucher-list-panel">
          <div className="voucher-list-header">
            <h2>Danh sách voucher</h2>
            <span className="voucher-count-badge">{vouchers.length} mã</span>
          </div>
          <div className="voucher-admin-list">
            {vouchers.map((voucher) => {
              const assignState = assignByVoucher[voucher.id] || {};
              const isAssignOpen = activeAssignVoucherId === voucher.id;
              const usagePercent = voucher.max_usage_global
                ? Math.min(100, Math.round((Number(voucher.current_usage || 0) / Number(voucher.max_usage_global)) * 100))
                : 0;

              return (
                <article key={voucher.id} className={`voucher-ticket-card ${voucher.status}`}>
                  <div className="voucher-ticket-main">
                    <div className="voucher-ticket-left">
                      <div className="ticket-discount-wrap">
                        <span className={`ticket-discount-val ${getDiscountText(voucher).length > 7 ? 'long-val' : ''}`}>
                          {getDiscountText(voucher)}
                        </span>
                        <span className="ticket-discount-lbl">GIẢM GIÁ</span>
                      </div>
                      <div className="ticket-notch notch-top" />
                      <div className="ticket-notch notch-bottom" />
                    </div>

                    <div className="voucher-ticket-divider" />

                    <div className="voucher-ticket-right">
                      <div className="ticket-header-row">
                        <span className={`voucher-status-badge ${voucher.status}`}>
                          <span className="status-badge-dot" />
                          {voucher.status === 'active' ? 'Đang chạy' : 'Đã tắt'}
                        </span>
                        <h3 className="ticket-code">{voucher.code}</h3>
                      </div>

                      <p className="ticket-desc">{voucher.description || 'Ưu đãi đặc biệt từ BeautyBook'}</p>

                      {voucher.max_usage_global && (
                        <div className="ticket-usage-progress">
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${usagePercent}%` }} />
                          </div>
                          <div className="progress-labels">
                            <span>Sử dụng: <strong>{voucher.current_usage || 0}</strong>/{voucher.max_usage_global} lượt</span>
                            <span>{usagePercent}%</span>
                          </div>
                        </div>
                      )}

                      <div className="voucher-ticket-meta">
                        <div className="meta-item">
                          <span className="meta-lbl">Đơn tối thiểu</span>
                          <span className="meta-val">{formatVnd(voucher.min_order_value)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-lbl">Hạn dùng</span>
                          <span className="meta-val">{formatDate(voucher.expiry_date)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-lbl">Nhóm áp dụng</span>
                          <span className="meta-val">
                            {voucher.customer_type ? (voucher.customer_type === 'both' ? 'Tất cả' : voucher.customer_type.toUpperCase()) : 'Tất cả'}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-actions-row">
                        <button
                          type="button"
                          className={`ticket-icon-btn assign ${isAssignOpen ? 'active' : ''}`}
                          onClick={() => setActiveAssignVoucherId(isAssignOpen ? null : voucher.id)}
                          title="Gán voucher cho khách hàng"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="16" y1="11" x2="22" y2="11" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="ticket-icon-btn edit"
                          onClick={() => startEditVoucher(voucher)}
                          title="Chỉnh sửa voucher"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>

                        {voucher.status === 'active' && (
                          <button
                            type="button"
                            className="ticket-icon-btn deactivate"
                            onClick={() => handleDeactivate(voucher.id)}
                            disabled={saving}
                            title="Tắt mã voucher"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAssignOpen && (
                    <div className="voucher-assign-drawer">
                      <h4>Gán mã voucher cho khách hàng</h4>
                      <div className="drawer-fields">
                        <div className="drawer-select-wrap">
                          <select
                            value={assignState.customer_id || ''}
                            onChange={(event) => updateAssignState(voucher.id, { customer_id: event.target.value })}
                          >
                            <option value="">Chọn khách hàng...</option>
                            {customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name} ({customer.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="drawer-email-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(assignState.send_email)}
                            onChange={(event) => updateAssignState(voucher.id, { send_email: event.target.checked })}
                          />
                          <span>Gửi thông báo email</span>
                        </label>

                        <button
                          type="button"
                          className="drawer-confirm-btn"
                          onClick={() => handleAssign(voucher.id)}
                          disabled={saving}
                        >
                          {saving ? 'Đang gán...' : 'Xác nhận gán'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}

export default ManageVouchers;
