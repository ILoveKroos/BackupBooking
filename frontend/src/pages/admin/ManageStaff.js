import React, { useEffect, useState } from 'react';
import staffService from '../../services/staffService';
import './ManageStaff.css';

const WEEKDAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const buildWeekFromRows = (rows = []) =>
  WEEKDAY_LABELS.map((label, dayIndex) => {
    const row = rows.find((item) => Number(item.day_of_week) === dayIndex);
    if (!row) {
      return {
        day_of_week: dayIndex,
        label,
        enabled: false,
        start: '09:00',
        end: '18:00'
      };
    }
    return {
      day_of_week: dayIndex,
      label,
      enabled: true,
      start: String(row.start_time).slice(0, 5),
      end: String(row.end_time).slice(0, 5)
    };
  });

const normalizeStaff = (list = []) =>
  list.map((item) => ({
    ...item,
    is_active: Number(item.is_active) === 1 || item.is_active === true
  }));

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    staff_role_id: ''
  });
  const [roleData, setRoleData] = useState({
    staff_role: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    password: '',
    is_active: true
  });
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchStaffRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAllStaff();
      setStaffList(normalizeStaff(response.data.data || []));
      setError('');
    } catch (err) {
      const apiMessage =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message;
      setError(apiMessage || 'Không thể tải danh sách nhân viên.');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await staffService.createStaff(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.phone.trim(),
        Number(formData.staff_role_id),
        true
      );
      setFormData({ name: '', email: '', password: '', phone: '', staff_role_id: '' });
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Tạo nhân viên thất bại.');
    }
  };

  const fetchStaffRoles = async () => {
    try {
      const response = await staffService.getAllStaffRoles();
      setStaffRoles(response.data.data || []);
    } catch (err) {
      setStaffRoles([]);
    }
  };

  const nextRoleId =
    staffRoles.length > 0 ? Math.max(...staffRoles.map((role) => Number(role.id) || 0)) + 1 : 0;

  const handleCreateRole = async (event) => {
    event.preventDefault();
    const normalizedRole = roleData.staff_role.trim();

    if (!normalizedRole) {
      alert('Vui lòng nhập tên vai trò.');
      return;
    }

    try {
      await staffService.createStaffRole(normalizedRole);
      setRoleData({ staff_role: '' });
      setShowRoleForm(false);
      fetchStaffRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Tạo vai trò thất bại.');
    }
  };

  const startEdit = (staff) => {
    setEditingId(staff.id);
    setEditData({
      name: staff.name || '',
      phone: staff.phone || '',
      password: '',
      is_active: !!staff.is_active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', phone: '', password: '', is_active: true });
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        name: editData.name.trim(),
        phone: editData.phone.trim(),
        is_active: editData.is_active
      };

      if (editData.password) {
        payload.password = editData.password;
      }

      await staffService.updateStaff(editingId, payload);
      cancelEdit();
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật nhân viên thất bại.');
    }
  };

  const handleToggleActive = async (staff) => {
    try {
      await staffService.updateStaff(staff.id, { is_active: !staff.is_active });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    }
  };

  const openScheduleModal = async (staff) => {
    setScheduleModal({ staff, days: buildWeekFromRows() });
    setScheduleLoading(true);
    try {
      const response = await staffService.getStaffWeeklyAvailability(staff.id);
      setScheduleModal({
        staff,
        days: buildWeekFromRows(response.data.data || [])
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải lịch làm việc.');
      setScheduleModal(null);
    } finally {
      setScheduleLoading(false);
    }
  };

  const closeScheduleModal = () => {
    if (scheduleSaving) {
      return;
    }
    setScheduleModal(null);
  };

  const updateScheduleDay = (dayIndex, patch) => {
    setScheduleModal((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day, index) =>
        index === dayIndex ? { ...day, ...patch } : day
      );
      return { ...prev, days: nextDays };
    });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleModal) {
      return;
    }

    const slots = scheduleModal.days
      .filter((day) => day.enabled)
      .map((day) => ({
        day_of_week: day.day_of_week,
        start_time: day.start,
        end_time: day.end
      }));

    try {
      setScheduleSaving(true);
      await staffService.replaceStaffWeeklyAvailability(scheduleModal.staff.id, slots);
      closeScheduleModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể lưu lịch làm việc.');
    } finally {
      setScheduleSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-staff">
      <h1>Quản lý nhân viên</h1>

      <div className="staff-toolbar">
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm((prev) => !prev);
            setShowRoleForm(false);
          }}
        >
          {showForm ? 'Đóng form nhân viên' : '+ Thêm nhân viên'}
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            setShowRoleForm((prev) => !prev);
            setShowForm(false);
          }}
        >
          {showRoleForm ? 'Đóng form vai trò' : '+ Thêm vai trò'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!error && staffList.length === 0 && (
        <div className="alert alert-info">Chưa có nhân viên nào để hiển thị.</div>
      )}

      {showForm && (
        <div className="staff-form-card">
          <h3>Tạo tài khoản nhân viên</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={formData.staff_role_id}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, staff_role_id: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn vai trò</option>
                  {staffRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-success">
              Tạo nhân viên
            </button>
          </form>
        </div>
      )}

      {showRoleForm && (
        <div className="staff-form-card">
          <h3>Tạo vai trò nhân viên</h3>
          <form onSubmit={handleCreateRole}>
            <div className="form-row">
              <div className="form-group">
                <label>ID</label>
                <input type="text" value={nextRoleId} readOnly />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <input
                  type="text"
                  value={roleData.staff_role}
                  onChange={(event) =>
                    setRoleData((prev) => ({ ...prev, staff_role: event.target.value }))
                  }
                  placeholder="Nhập tên vai trò"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-success">
              Tạo vai trò
            </button>
          </form>
        </div>
      )}

      <div className="staff-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Mật khẩu mới</th>
              <th>Số lịch</th>
              <th>Trạng thái</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-cell">
                  Chưa có dữ liệu nhân viên.
                </td>
              </tr>
            )}

            {staffList.map((staff) => {
              const isEditing = editingId === staff.id;

              return (
                <tr key={staff.id}>
                  <td>{staff.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editData.name}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                    ) : (
                      staff.name
                    )}
                  </td>
                  <td>{staff.email}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editData.phone}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, phone: event.target.value }))
                        }
                      />
                    ) : (
                      staff.phone || '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="password"
                        value={editData.password}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, password: event.target.value }))
                        }
                        placeholder="Để trống nếu không đổi"
                      />
                    ) : (
                      <span className="password-placeholder">Không hiển thị</span>
                    )}
                  </td>
                  <td>{staff.total_appointments || 0}</td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editData.is_active ? '1' : '0'}
                        onChange={(event) =>
                          setEditData((prev) => ({
                            ...prev,
                            is_active: event.target.value === '1'
                          }))
                        }
                      >
                        <option value="1">Đang hoạt động</option>
                        <option value="0">Tạm khóa</option>
                      </select>
                    ) : (
                      <span className={`staff-status ${staff.is_active ? 'active' : 'inactive'}`}>
                        {staff.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    )}
                  </td>
                  <td>{staff.role_name || '-'}</td>
                  <td>
                    {isEditing ? (
                      <div className="staff-actions">
                        <button className="btn-success btn-small" onClick={handleSaveEdit}>
                          Lưu
                        </button>
                        <button className="btn-secondary btn-small" onClick={cancelEdit}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="staff-actions">
                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          onClick={() => openScheduleModal(staff)}
                        >
                          Xem lịch
                        </button>
                        <button className="btn-secondary btn-small" onClick={() => startEdit(staff)}>
                          Sửa
                        </button>
                        <button
                          className={`btn-small ${staff.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleActive(staff)}
                        >
                          {staff.is_active ? 'Tạm khóa' : 'Kích hoạt'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {scheduleModal && (
        <div className="staff-schedule-overlay" onClick={closeScheduleModal}>
          <div
            className="staff-schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-schedule-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-schedule-header">
              <div>
                <p className="staff-schedule-kicker">Lịch làm việc hằng tuần</p>
                <h3 id="staff-schedule-title">{scheduleModal.staff.name || 'Nhân viên'}</h3>
                <p className="staff-schedule-hint">
                  Chỉ các khung giờ nằm trong lịch này mới hiển thị cho khách khi đặt lịch. Nếu chưa cấu hình ngày
                  nào, hệ thống coi như nhân viên có thể nhận lịch mọi khung giờ (trừ khi trùng lịch).
                </p>
              </div>
              <button
                type="button"
                className="staff-schedule-close"
                onClick={closeScheduleModal}
                aria-label="Đóng"
                disabled={scheduleSaving}
              >
                ×
              </button>
            </div>

            {scheduleLoading ? (
              <div className="staff-schedule-loading">Đang tải lịch...</div>
            ) : (
              <>
                <div className="staff-schedule-table-wrap">
                  <table className="staff-schedule-table">
                    <thead>
                      <tr>
                        <th>Ngày trong tuần</th>
                        <th>Làm việc</th>
                        <th>Từ</th>
                        <th>Đến</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleModal.days.map((day, index) => (
                        <tr key={day.day_of_week}>
                          <td>{day.label}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={day.enabled}
                              onChange={(event) =>
                                updateScheduleDay(index, { enabled: event.target.checked })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={day.start}
                              disabled={!day.enabled}
                              onChange={(event) => updateScheduleDay(index, { start: event.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={day.end}
                              disabled={!day.enabled}
                              onChange={(event) => updateScheduleDay(index, { end: event.target.value })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="staff-schedule-actions">
                  <button
                    type="button"
                    className="btn-success"
                    onClick={handleSaveSchedule}
                    disabled={scheduleSaving}
                  >
                    {scheduleSaving ? 'Đang lưu...' : 'Lưu lịch'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeScheduleModal}
                    disabled={scheduleSaving}
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStaff;
