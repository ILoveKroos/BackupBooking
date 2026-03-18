import React, { useState, useEffect } from 'react';
import serviceService from '../../services/serviceService';
import './ManageServices.css';

function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      setServices(response.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await serviceService.createService(
        formData.name,
        formData.description,
        parseFloat(formData.price),
        parseInt(formData.duration)
      );
      setFormData({ name: '', description: '', price: '', duration: '' });
      setShowForm(false);
      fetchServices();
    } catch (err) {
      alert('Tạo dịch vụ thất bại.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await serviceService.deleteService(id);
        fetchServices();
      } catch (err) {
        alert('Xóa dịch vụ thất bại.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-services">
      <h1>Quản lý dịch vụ</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? 'Hủy' : '+ Thêm dịch vụ mới'}
      </button>

      {showForm && (
        <div className="form-card">
          <h3>Thêm dịch vụ mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên dịch vụ</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-success">
              Tạo dịch vụ
            </button>
          </form>
        </div>
      )}

      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên dịch vụ</th>
              <th>Giá</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.price.toLocaleString('vi-VN')} VNĐ</td>
                <td>{service.duration} phút</td>
                <td>
                  <span className={`status ${service.status}`}>
                    {service.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="btn-danger btn-small"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageServices;
