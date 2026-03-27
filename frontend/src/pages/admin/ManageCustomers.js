import React, { useEffect, useMemo, useState } from 'react';
import customerService from '../../services/customerService';
import './ManageCustomers.css';

const normalizeCustomers = (list = []) =>
  list.map((item) => ({
    ...item,
    is_active: Number(item.is_active) === 1 || item.is_active === true
  }));

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers();
      setCustomers(normalizeCustomers(response.data.data || []));
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return customers;
    }

    return customers.filter((customer) => {
      const name = (customer.name || '').toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const phone = (customer.phone || '').toLowerCase();
      return (
        name.includes(normalizedKeyword) ||
        email.includes(normalizedKeyword) ||
        phone.includes(normalizedKeyword)
      );
    });
  }, [customers, keyword]);

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      await customerService.createCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        is_active: formData.is_active
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        is_active: true
      });
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Thêm khách hàng thất bại.');
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setEditData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      is_active: !!customer.is_active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      name: '',
      email: '',
      phone: '',
      is_active: true
    });
  };

  const handleSaveEdit = async () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và email.');
      return;
    }

    try {
      await customerService.updateCustomer(editingId, {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
        is_active: editData.is_active
      });
      cancelEdit();
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật khách hàng thất bại.');
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-customers">
      <h1>Quản lý khách hàng</h1>

      <div className="customers-toolbar">
        <button className="btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Đóng form' : '+ Thêm khách hàng'}
        </button>

        <input
          type="text"
          placeholder="Tìm theo tên, email hoặc số điện thoại"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      {showForm && (
        <div className="customer-form-card">
          <h3>Thêm khách hàng mới</h3>
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

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
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
                <label>Trạng thái</label>
                <select
                  value={formData.is_active ? '1' : '0'}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: event.target.value === '1'
                    }))
                  }
                >
                  <option value="1">Đang hoạt động</option>
                  <option value="0">Tạm khóa</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-success">
              Tạo khách hàng
            </button>
          </form>
        </div>
      )}

      <div className="customer-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Số lịch</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  Chưa có khách hàng phù hợp.
                </td>
              </tr>
            )}

            {filteredCustomers.map((customer) => {
              const isEditing = editingId === customer.id;

              return (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editData.name}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                    ) : (
                      customer.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                    ) : (
                      customer.email
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editData.phone}
                        onChange={(event) =>
                          setEditData((prev) => ({ ...prev, phone: event.target.value }))
                        }
                      />
                    ) : (
                      customer.phone || '-'
                    )}
                  </td>
                  <td>{customer.total_appointments || 0}</td>
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
                      <span className={`customer-status ${customer.is_active ? 'active' : 'inactive'}`}>
                        {customer.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="customer-actions">
                        <button className="btn-success btn-small" onClick={handleSaveEdit}>
                          Lưu
                        </button>
                        <button className="btn-secondary btn-small" onClick={cancelEdit}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="customer-actions">
                        <button className="btn-secondary btn-small" onClick={() => startEdit(customer)}>
                          Sửa
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
    </div>
  );
}

export default ManageCustomers;
