import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import serviceService from '../services/serviceService';
import { formatDurationLabel, formatVnd } from '../utils/formatters';
import './Services.css';

const getCollectionLabel = (category) => {
  const key = (category || '').toLowerCase();

  if (key.includes('hair') || key.includes('toc') || key.includes('tóc')) {
    return 'Moon Signature';
  }

  if (key.includes('lash') || key.includes('brow')) {
    return 'Lash & Brow Atelier';
  }

  if (key.includes('nail')) {
    return 'Nail Studio';
  }

  if (key.includes('facial') || key.includes('skin')) {
    return 'Skin Ritual';
  }

  if (key.includes('massage')) {
    return 'Body Recovery';
  }

  return 'Boutique Pick';
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [preferredDate, setPreferredDate] = useState(searchParams.get('date') || '');

  const user = authService.getUser();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setPreferredDate(searchParams.get('date') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getAllServices();
        setServices(response.data.data || []);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách dịch vụ.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const list = services
      .map((service) => service.category)
      .filter((category) => typeof category === 'string' && category.trim() !== '');

    return ['all', ...new Set(list)];
  }, [services]);

  const priceSummary = useMemo(() => {
    if (services.length === 0) {
      return null;
    }

    const prices = services.map((service) => Number(service.price) || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [services]);

  useEffect(() => {
    if (activeCategory === 'all') {
      return;
    }

    if (!categories.includes(activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, categories]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const withFilters = services.filter((service) => {
      const name = (service.name || '').toLowerCase();
      const description = (service.description || '').toLowerCase();
      const category = (service.category || '').toLowerCase();
      const duration = Number(service.duration) || 0;
      const price = Number(service.price) || 0;

      const matchesQuery =
        normalizedQuery === '' ||
        name.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        category.includes(normalizedQuery);

      const matchesCategory =
        activeCategory === 'all' ||
        (service.category || '').toLowerCase() === activeCategory.toLowerCase();

      const matchesDuration =
        durationFilter === 'all' ||
        (durationFilter === 'under-45' && duration <= 45) ||
        (durationFilter === '45-75' && duration > 45 && duration <= 75) ||
        (durationFilter === 'over-75' && duration > 75);

      const matchesPriceRange =
        priceRange === 'all' ||
        (priceRange === 'under-300' && price < 300000) ||
        (priceRange === '300-700' && price >= 300000 && price <= 700000) ||
        (priceRange === 'over-700' && price > 700000);

      return matchesQuery && matchesCategory && matchesDuration && matchesPriceRange;
    });

    const sorted = [...withFilters];

    sorted.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const durationA = Number(a.duration) || 0;
      const durationB = Number(b.duration) || 0;
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;

      if (sortBy === 'price-asc') {
        return priceA - priceB;
      }

      if (sortBy === 'price-desc') {
        return priceB - priceA;
      }

      if (sortBy === 'duration-asc') {
        return durationA - durationB;
      }

      return idB - idA;
    });

    return sorted;
  }, [activeCategory, durationFilter, priceRange, query, services, sortBy]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    if (preferredDate) {
      params.set('date', preferredDate);
    } else {
      params.delete('date');
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery('');
    setPreferredDate('');
    setActiveCategory('all');
    setDurationFilter('all');
    setPriceRange('all');
    setSortBy('recommended');
    setSearchParams({});
  };

  const getBookingAction = (serviceId) => {
    if (!user) {
      return {
        target: '/login',
        label: 'Đăng nhập để đặt lịch'
      };
    }

    if (user.role === 'customer') {
      return {
        target: `/booking/${serviceId}`,
        label: 'Đặt lịch'
      };
    }

    return {
      target: `/services/${serviceId}`,
      label: 'Xem chi tiết'
    };
  };

  if (loading) {
    return <div className="loading">Đang tải danh sách dịch vụ...</div>;
  }

  return (
    <div className="services-marketplace">
      <section className="marketplace-hero">
        <div>
          <span className="hero-kicker">FRESHA FLOW + MOON VIBE</span>
          <h1>Khám phá dịch vụ với giá thực tế.</h1>
          <p>
            Giao diện tìm kiếm gọn, so sánh giá minh bạch và đặt lịch ngay
            khi thấy khung giờ phù hợp.
          </p>
        </div>
        <div className="hero-note">
          <strong>
            {priceSummary
              ? `Giá từ ${formatVnd(priceSummary.min)} đến ${formatVnd(priceSummary.max)}`
              : 'Giá đã cập nhật theo bảng dịch vụ thực tế.'}
          </strong>
          <small>{`${services.length} dịch vụ được đồng bộ trực tiếp từ cơ sở dữ liệu.`}</small>
        </div>
      </section>

      <section className="marketplace-controls">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên dịch vụ, mô tả..."
          />
          <input
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            Tìm lịch
          </button>
        </form>

        <div className="filter-row">
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recommended">Sắp xếp: Đề xuất</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="duration-asc">Thời gian: Nhanh nhất</option>
          </select>

          <select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)}>
            <option value="all">Thời lượng: Tất cả</option>
            <option value="under-45">Dưới 45 phút</option>
            <option value="45-75">45 đến 75 phút</option>
            <option value="over-75">Trên 75 phút</option>
          </select>

          <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
            <option value="all">Giá: Tất cả</option>
            <option value="under-300">Dưới 300.000 VND</option>
            <option value="300-700">300.000 - 700.000 VND</option>
            <option value="over-700">Trên 700.000 VND</option>
          </select>

          <button type="button" className="btn-clear" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>

        {categories.length > 1 && (
          <div className="category-chips">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'chip active' : 'chip'}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'all' ? 'Tất cả' : category}
              </button>
            ))}
          </div>
        )}
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="results-head">
        <p>
          Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ
          {preferredDate ? ` cho ngày ${preferredDate}` : ''}.
        </p>
      </section>

      {filteredServices.length === 0 ? (
        <div className="empty-state">
          <h3>Chưa có dịch vụ phù hợp</h3>
          <p>Thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => {
            const price = Number(service.price) || 0;
            const duration = Number(service.duration) || 0;
            const bookingAction = getBookingAction(service.id);

            return (
              <article key={service.id} className="service-card">
                <div className="service-badges">
                  <span className="category-pill">{service.category || 'Beauty service'}</span>
                  <span className="collection-pill">{getCollectionLabel(service.category)}</span>
                </div>

                <div className="service-card-top">
                  <h3>{service.name}</h3>
                  <span>{formatDurationLabel(duration)}</span>
                </div>

                <p>{service.description || 'Mô tả đang được cập nhật cho dịch vụ này.'}</p>

                <div className="service-meta">
                  <div className="price-block">
                    <strong>{formatVnd(price)}</strong>
                    <small>Giá tại salon</small>
                  </div>
                  <small className="meta-note">Đặt nhanh trên hệ thống</small>
                </div>

                <div className="service-actions">
                  <Link to={`/services/${service.id}`} className="btn-details">
                    Xem chi tiết
                  </Link>
                  <Link to={bookingAction.target} className="btn-primary">
                    {bookingAction.label}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Services;
