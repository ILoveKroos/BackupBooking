import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import serviceService from '../services/serviceService';
import { formatVnd } from '../utils/formatters';
import './Home.css';

const COUNTER_STORAGE_KEY = 'home_fake_appointments_counter';
const COUNTER_TICK_MS = 2500;

const getLocalDateKey = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const createSeedCount = () => 24 + Math.floor(Math.random() * 21);

const readStoredCounter = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(COUNTER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.date !== 'string' ||
      !Number.isFinite(parsed.count) ||
      parsed.count < 0
    ) {
      return null;
    }

    return {
      date: parsed.date,
      count: Math.floor(parsed.count)
    };
  } catch (error) {
    return null;
  }
};

const saveCounter = (counter) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counter));
  } catch (error) {
    // Ignore storage errors.
  }
};

const getInitialCounter = () => {
  const todayKey = getLocalDateKey();
  const stored = readStoredCounter();

  if (stored && stored.date === todayKey) {
    return stored;
  }

  const freshCounter = { date: todayKey, count: createSeedCount() };
  saveCounter(freshCounter);
  return freshCounter;
};

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState('');
  const [liveCounter, setLiveCounter] = useState(() => getInitialCounter());

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await serviceService.getAllServices();

        if (!cancelled) {
          setServices(response.data.data || []);
          setServiceError('');
        }
      } catch (error) {
        if (!cancelled) {
          setServices([]);
          setServiceError('Không thể tải dữ liệu dịch vụ từ hệ thống.');
        }
      } finally {
        if (!cancelled) {
          setLoadingServices(false);
        }
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLiveCounter((currentCounter) => {
        const todayKey = getLocalDateKey();

        if (currentCounter.date !== todayKey) {
          const resetCounter = {
            date: todayKey,
            count: createSeedCount()
          };
          saveCounter(resetCounter);
          return resetCounter;
        }

        const increment = Math.random() < 0.75 ? 1 : 2;
        const nextCounter = {
          date: currentCounter.date,
          count: currentCounter.count + increment
        };
        saveCounter(nextCounter);
        return nextCounter;
      });
    }, COUNTER_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const normalizedServices = useMemo(
    () =>
      services.map((service) => ({
        ...service,
        price: Number(service.price) || 0,
        duration: Number(service.duration) || 0
      })),
    [services]
  );

  const featuredServices = useMemo(() => normalizedServices.slice(0, 8), [normalizedServices]);

  const categoryChips = useMemo(() => {
    const categories = [
      ...new Set(
        normalizedServices
          .map((service) => service.category)
          .filter((category) => typeof category === 'string' && category.trim() !== '')
      )
    ];

    if (categories.length > 0) {
      return categories.slice(0, 8);
    }

    return ['Nails', 'Hair', 'Massage', 'Facial', 'Brows'];
  }, [normalizedServices]);

  const priceSummary = useMemo(() => {
    if (normalizedServices.length === 0) {
      return null;
    }

    const prices = normalizedServices.map((service) => service.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [normalizedServices]);

  const averageDuration = useMemo(() => {
    if (normalizedServices.length === 0) {
      return 0;
    }

    const totalDuration = normalizedServices.reduce((sum, service) => sum + service.duration, 0);
    return Math.round(totalDuration / normalizedServices.length);
  }, [normalizedServices]);

  const liveCounterDateLabel = useMemo(() => {
    const [year, month, day] = liveCounter.date.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  }, [liveCounter.date]);

  const buildServiceUrl = (searchKeyword, searchDate) => {
    const params = new URLSearchParams();

    if (searchKeyword) {
      params.set('q', searchKeyword.trim());
    }

    if (searchDate) {
      params.set('date', searchDate);
    }

    const queryString = params.toString();
    return queryString ? `/services?${queryString}` : '/services';
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(buildServiceUrl(keyword, date));
  };

  const handleCategoryClick = (category) => {
    navigate(buildServiceUrl(category, date));
  };

  return (
    <div className="home-fresha">
      <section className="fresha-hero">
        <div className="fresha-hero-content">
          <span className="fresha-eyebrow">Marketplace-style booking</span>
          <h1>Đặt lịch làm đẹp nhanh, gọn.</h1>
          <p>
            Tra cứu dịch vụ theo giá thật từ cơ sở dữ liệu, chọn ngày phù hợp và chuyển sang màn đặt
            lịch chỉ với vài thao tác.
          </p>

          <form className="fresha-search" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <label>Dịch vụ</label>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nối mi, cắt tóc, gội đầu..."
              />
            </div>

            <div className="search-field">
              <label>Ngày</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                min={today}
              />
            </div>

            <button type="submit" className="btn-primary">
              Tìm lịch trống
            </button>
          </form>

          <div className="quick-categories">
            {categoryChips.map((category) => (
              <button
                type="button"
                key={category}
                className="category-pill"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <aside className="fresha-hero-side">
          <article className="live-counter-card">
            <span>Số cuộc hẹn đã đặt hôm nay</span>
            <strong>{liveCounter.count.toLocaleString('vi-VN')}</strong>
            <small>
              <i className="live-dot" />
              Đang cập nhật liên tục, reset lúc 00:00 ({liveCounterDateLabel})
            </small>
          </article>

          <article>
            <span>Dịch vụ đang mở</span>
            <strong>{normalizedServices.length}</strong>
          </article>
          <article>
            <span>Khoảng giá</span>
            <strong>
              {priceSummary ? `${formatVnd(priceSummary.min)} - ${formatVnd(priceSummary.max)}` : '--'}
            </strong>
          </article>
          <article>
            <span>Thời lượng trung bình</span>
            <strong>{averageDuration > 0 ? `${averageDuration} phút` : '--'}</strong>
          </article>
          <Link to="/services" className="hero-side-cta">
            Xem toàn bộ dịch vụ
          </Link>
        </aside>
      </section>

      <section className="fresha-listing">
        <div className="listing-head">
          <h2>Dịch vụ nổi bật</h2>
          <Link to="/services">Xem tất cả</Link>
        </div>

        {loadingServices && <p className="listing-empty">Đang tải danh sách dịch vụ...</p>}
        {!loadingServices && serviceError && <div className="alert alert-error">{serviceError}</div>}
        {!loadingServices && !serviceError && featuredServices.length === 0 && (
          <p className="listing-empty">Chưa có dịch vụ nào trong hệ thống.</p>
        )}

        {!loadingServices && !serviceError && featuredServices.length > 0 && (
          <div className="service-market-grid">
            {featuredServices.map((service) => (
              <article className="service-market-card" key={service.id}>
                <div className="service-market-top">
                  <span>{service.category || 'Beauty'}</span>
                  <small>4.9 ★</small>
                </div>

                <h3>{service.name}</h3>
                <p>{service.description || 'Mô tả đang được cập nhật cho dịch vụ này.'}</p>

                <div className="service-market-meta">
                  <strong>{formatVnd(service.price)}</strong>
                  <span>{service.duration} phút</span>
                </div>

                <div className="service-market-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => handleCategoryClick(service.category || service.name)}
                  >
                    Tìm tương tự
                  </button>
                  <Link to={`/services/${service.id}`} className="btn-link">
                    Chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="fresha-flow">
        <h2>Đặt lịch theo flow 3 bước</h2>
        <div className="flow-grid">
          <article>
            <strong>01</strong>
            <h3>Tìm dịch vụ</h3>
            <p>Lọc theo danh mục hoặc từ khóa để xem đúng nhu cầu.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Chọn ngày và nhân viên</h3>
            <p>Hệ thống hiển thị khung giờ trống và nhân viên phù hợp.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Xác nhận nhanh</h3>
            <p>Theo dõi trạng thái lịch hẹn ngay trong tài khoản của bạn.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
