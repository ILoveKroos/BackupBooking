import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import serviceService from '../../../services/serviceService';
import { resolveServiceImageUrl } from '../../../utils/serviceImage';
import './ManageServices.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/jfif'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  duration: '',
  category: '',
  image_url: '',
  image_data: '',
  image_name: '',
  status: 'active'
};

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh đã chọn.'));
    reader.readAsDataURL(file);
  });

function ManageServices() {
  const [services, setServices] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeComposer, setActiveComposer] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [categoryFormData, setCategoryFormData] = useState({ category_name: '' });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimerRef = useRef(null);

  const showSuccess = useCallback((message) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => setSuccessMessage(''), 2000);
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAdminServices();
      setServices(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await serviceService.getAllCategories();
      setDbCategories(response.data.data || []);
    } catch (err) {
      console.error('Không thể tải danh mục:', err);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchCategories, fetchServices]);

  useEffect(() => () => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
  }, []);

  const isComposerOpen = Boolean(activeComposer);

  const resetServiceForm = () => {
    setFormData(EMPTY_FORM);
    setEditingServiceId(null);
    setImageInputKey((prev) => prev + 1);
  };

  const closeComposer = () => {
    setActiveComposer(null);
    setActionError('');
    setCategoryFormData({ category_name: '' });
    resetServiceForm();
  };

  const openNewServiceForm = () => {
    resetServiceForm();
    setCategoryFormData({ category_name: '' });
    setActionError('');
    setActiveComposer('service');
  };

  const openCategoryComposer = () => {
    setCategoryFormData({ category_name: '' });
    setEditingServiceId(null);
    setActionError('');
    setActiveComposer('category');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setActionError('');
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setActionError('Vui lòng chọn ảnh JPG, PNG, GIF hoặc WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setActionError('Ảnh dịch vụ phải nhỏ hơn 5MB.');
      event.target.value = '';
      return;
    }

    try {
      const imageData = await readFileAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        image_data: typeof imageData === 'string' ? imageData : '',
        image_name: file.name
      }));
      setActionError('');
    } catch (err) {
      setActionError(err.message || 'Không thể đọc file ảnh đã chọn.');
      event.target.value = '';
    }
  };

  const handleDirectImageUpload = async (serviceId, service, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setActionError('Vui lòng chọn ảnh JPG, PNG, GIF hoặc WEBP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setActionError('Ảnh dịch vụ phải nhỏ hơn 5MB.');
      return;
    }

    try {
      setActionLoadingId(serviceId);
      const imageData = await readFileAsDataUrl(file);
      
      const payload = {
        name: service.name,
        description: service.description || '',
        price: Number(service.price),
        duration: Number(service.duration),
        category: service.category || '',
        status: service.status,
        image_url: service.image_url || '',
        image_data: typeof imageData === 'string' ? imageData : ''
      };

      await serviceService.updateService(serviceId, payload);
      showSuccess('Cập nhật ảnh dịch vụ thành công!');
      fetchServices();
      setActionError('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Tải ảnh lên thất bại.');
    } finally {
      setActionLoadingId(null);
      event.target.value = '';
    }
  };

  const clearSelectedImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_data: '',
      image_name: ''
    }));
    setImageInputKey((prev) => prev + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      duration: Number(formData.duration),
      category: formData.category.trim(),
      status: formData.status,
      image_url: formData.image_url.trim(),
      image_data: formData.image_data
    };

    if (!payload.name || !Number.isFinite(payload.price) || !Number.isFinite(payload.duration)) {
      setActionError('Vui lòng nhập tên, giá và thời gian hợp lệ.');
      return;
    }

    if (payload.price < 0 || payload.duration <= 0) {
      setActionError('Giá và thời gian phải lớn hơn 0.');
      return;
    }

    try {
      if (editingServiceId) {
        await serviceService.updateService(editingServiceId, payload);
        showSuccess('Cập nhật dịch vụ thành công!');
      } else {
        await serviceService.createService(payload);
        showSuccess('Tạo dịch vụ thành công!');
      }

      closeComposer();
      fetchServices();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          (editingServiceId ? 'Cập nhật dịch vụ thất bại.' : 'Tạo dịch vụ thất bại.')
      );
    }
  };

  const startEditService = (service) => {
    setEditingServiceId(service.id);
    setActionError('');
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: String(Number(service.price) || ''),
      duration: String(Number(service.duration) || ''),
      category: service.category || '',
      status: service.status || 'active',
      image_url: service.image_url || '',
      image_data: '',
      image_name: ''
    });
    setImageInputKey((prev) => prev + 1);
    setActiveComposer('service');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;

    try {
      setActionLoadingId(id);
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
      if (editingServiceId === id) closeComposer();
      setActionError('');
      showSuccess('Xóa dịch vụ thành công!');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Xóa dịch vụ thất bại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCategoryInputChange = (event) => {
    const { name, value } = event.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryFormData.category_name.trim()) {
      setActionError('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      await serviceService.createCategory({ category_name: categoryFormData.category_name.trim() });
      setCategoryFormData({ category_name: '' });
      setActionError('');
      showSuccess('Tạo danh mục thành công!');
      await fetchCategories();
      fetchServices();
      setActiveComposer(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Tạo danh mục thất bại.');
    }
  };

  const previewImage = useMemo(
    () => resolveServiceImageUrl(formData.image_data || formData.image_url, FALLBACK_IMAGE),
    [formData.image_data, formData.image_url]
  );

  const activeCount = useMemo(
    () => services.filter((service) => service.status === 'active').length,
    [services]
  );

  const categoryCount = useMemo(
    () => new Set(services.map((service) => service.category).filter(Boolean)).size,
    [services]
  );

  const renderStatus = (status) => (
    <span className={`status ${status}`}>
      <span className="status-dot" aria-hidden="true" />
      <span className="status-label">{status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}</span>
    </span>
  );

  const renderServiceActions = (service) => {
    const isBusy = actionLoadingId === service.id;

    return (
      <div className="action-group">
        <button
          type="button"
          onClick={() => startEditService(service)}
          className="btn-icon edit"
          title="Sửa dịch vụ"
          disabled={isBusy}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>

        <label
          htmlFor={`direct-upload-${service.id}`}
          className={`btn-icon upload ${isBusy ? 'disabled' : ''}`}
          title="Tải ảnh lên trực tiếp"
        >
          <input
            id={`direct-upload-${service.id}`}
            type="file"
            accept="image/*"
            onChange={(event) => handleDirectImageUpload(service.id, service, event)}
            style={{ display: 'none' }}
            disabled={isBusy}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </label>

        <button
          type="button"
          onClick={() => handleDelete(service.id)}
          className="btn-icon delete"
          title={isBusy && actionLoadingId === service.id ? 'Đang xóa...' : 'Xóa dịch vụ'}
          disabled={isBusy}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="manage-services">
      {successMessage && (
        <div className="success-toast-overlay">
          <div className="success-toast">
            <span className="success-toast-icon">✓</span>
            <span className="success-toast-text">{successMessage}</span>
          </div>
        </div>
      )}

      <section className="services-hero">
        <div className="services-hero-copy">
          <p className="services-hero-kicker">Admin</p>
          <h1>Quản lý dịch vụ</h1>
          <p className="services-page-note">
            Cập nhật dịch vụ, danh mục, hình ảnh và trạng thái hiển thị trong một màn hình vận hành gọn.
          </p>
        </div>

        <div className="services-hero-actions">
          <button
            type="button"
            onClick={openNewServiceForm}
            className="service-add-button"
            aria-label="Thêm dịch vụ hoặc danh mục"
          >
            <span className="service-add-symbol" aria-hidden="true">+</span>
            <span>Thêm</span>
          </button>

          <div className="services-hero-stats" aria-label="Tóm tắt dịch vụ">
            <span><strong>{services.length}</strong> dịch vụ</span>
            <span><strong>{activeCount}</strong> đang mở</span>
            <span><strong>{categoryCount}</strong> danh mục</span>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {actionError && !isComposerOpen && <div className="alert alert-error">{actionError}</div>}

      {isComposerOpen && (
        <div
          className="service-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeComposer();
          }}
        >
          <section className="service-composer" role="dialog" aria-modal="true" aria-labelledby="service-composer-title">
            <div className="service-composer-head">
              <div>
                <p className="service-composer-kicker">Thao tác nhanh</p>
                <h2 id="service-composer-title">
                  {activeComposer === 'category'
                    ? 'Thêm danh mục'
                    : editingServiceId
                      ? 'Cập nhật dịch vụ'
                      : 'Thêm dịch vụ'}
                </h2>
              </div>
              <button type="button" className="composer-close" onClick={closeComposer} aria-label="Đóng">
                ×
              </button>
            </div>

            <div className="composer-tabs" role="tablist" aria-label="Chọn loại thao tác">
              <button
                type="button"
                role="tab"
                aria-selected={activeComposer === 'service'}
                className={activeComposer === 'service' ? 'active' : ''}
                onClick={() => {
                  if (activeComposer !== 'service') openNewServiceForm();
                }}
              >
                <span aria-hidden="true">+</span>
                Dịch vụ
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeComposer === 'category'}
                className={activeComposer === 'category' ? 'active' : ''}
                onClick={openCategoryComposer}
              >
                <span aria-hidden="true">+</span>
                Danh mục
              </button>
            </div>

            {actionError && <div className="alert alert-error composer-alert">{actionError}</div>}

            {activeComposer === 'category' ? (
              <form className="composer-form" onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label>Tên danh mục</label>
                  <input
                    type="text"
                    name="category_name"
                    value={categoryFormData.category_name}
                    onChange={handleCategoryInputChange}
                    placeholder="Ví dụ: Chăm sóc da"
                    required
                  />
                </div>

                <div className="action-group composer-actions">
                  <button type="submit" className="btn-success">Tạo danh mục</button>
                  <button type="button" className="btn-neutral" onClick={closeComposer}>Hủy</button>
                </div>
              </form>
            ) : (
              <form className="composer-form" onSubmit={handleSubmit}>
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
                      min="0"
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
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="">Chọn danh mục</option>
                      {dbCategories.map((category) => (
                        <option key={category.id} value={category.category_name}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                  </div>
                </div>

                <div className="form-group image-upload-field">
                  <label>Ảnh dịch vụ</label>
                  <input
                    key={imageInputKey}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,.jfif"
                    onChange={handleImageChange}
                  />
                  <small className="field-hint">Chọn file từ máy tính, tối đa 5MB.</small>
                  {formData.image_name && (
                    <div className="selected-file-row">
                      <span className="selected-file-name">Đã chọn: {formData.image_name}</span>
                      <button type="button" className="btn-neutral btn-small" onClick={clearSelectedImage}>
                        Bỏ ảnh
                      </button>
                    </div>
                  )}
                </div>

                <div className="image-preview-strip">
                  <div className="image-preview-text">
                    <strong>Xem trước ảnh</strong>
                    <span>{formData.image_name ? 'Ảnh mới từ máy tính.' : 'Ảnh hiện tại hoặc ảnh mặc định.'}</span>
                  </div>
                  <img
                    src={previewImage}
                    alt={formData.name || 'Ảnh xem trước dịch vụ'}
                    className="service-preview-image"
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== FALLBACK_IMAGE) {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>

                <div className="action-group composer-actions">
                  <button type="submit" className="btn-success">
                    {editingServiceId ? 'Lưu cập nhật' : 'Tạo dịch vụ'}
                  </button>
                  <button type="button" className="btn-neutral" onClick={closeComposer}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      <section className="services-table-shell">
        <div className="services-table-header">
          <div>
            <p className="services-table-kicker">Danh sách dịch vụ</p>
            <h2>Dịch vụ hiện có</h2>
          </div>

          <div className="services-toolbar">
            <div className="view-toggle" role="tablist" aria-label="Chế độ xem">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'table'}
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
              >
                Bảng
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                Lưới
              </button>
            </div>

            <button type="button" className="table-add-button" onClick={openNewServiceForm} aria-label="Thêm dịch vụ">
              +
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="services-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên dịch vụ</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      Chưa có dịch vụ nào.
                    </td>
                  </tr>
                )}

                {services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>
                      <img
                        src={resolveServiceImageUrl(service.image_url, FALLBACK_IMAGE)}
                        alt={service.name}
                        className="service-thumb"
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.src !== FALLBACK_IMAGE) {
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }
                        }}
                      />
                    </td>
                    <td>
                      <strong className="service-name-cell">{service.name}</strong>
                    </td>
                    <td>{service.category || '-'}</td>
                    <td>{formatVnd(service.price)}</td>
                    <td>{service.duration} phút</td>
                    <td>{renderStatus(service.status)}</td>
                    <td>{renderServiceActions(service)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="services-grid">
            {services.length === 0 ? (
              <div className="service-grid-empty">Chưa có dịch vụ nào.</div>
            ) : (
              services.map((service) => (
                <article key={service.id} className="service-grid-card">
                  <img
                    src={resolveServiceImageUrl(service.image_url, FALLBACK_IMAGE)}
                    alt={service.name}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== FALLBACK_IMAGE) {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                  <div className="service-grid-body">
                    <div className="service-grid-title">
                      <span>{service.category || 'Chưa phân loại'}</span>
                      <h3>{service.name}</h3>
                    </div>
                    <div className="service-grid-meta">
                      <span>{formatVnd(service.price)}</span>
                      <span>{service.duration} phút</span>
                    </div>
                    <div className="service-grid-footer">
                      {renderStatus(service.status)}
                      {renderServiceActions(service)}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageServices;
