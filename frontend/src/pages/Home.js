import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import serviceService from '../services/serviceService';
import { formatVnd } from '../utils/formatters';
import './Home.css';

const COUNTER_STORAGE_KEY = 'home_fake_appointments_counter';
const COUNTER_TICK_MS = 2500;
const REVIEW_ROTATE_MS = 3200;
const REVIEWS_VISIBLE_COUNT = 3;
const FALLBACK_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80';

const customerReviews = [
  {
    id: 1,
    name: 'Minh Anh',
    service: 'Nâng mi và nhuộm mi',
    rating: 5,
    time: '2 ngày trước',
    comment: 'Đặt lịch nhanh, nhân viên tư vấn rõ và làm rất cẩn thận.'
  },
  {
    id: 2,
    name: 'Thu Hà',
    service: 'Chăm sóc da cấp ẩm',
    rating: 5,
    time: '3 ngày trước',
    comment: 'Giá hiển thị đúng như lúc đặt, trải nghiệm dịch vụ sạch sẽ và chuyên nghiệp.'
  },
  {
    id: 3,
    name: 'Ngọc Trâm',
    service: 'Sơn gel chăm sóc móng',
    rating: 4,
    time: '5 ngày trước',
    comment: 'Dễ chọn giờ và theo dõi trạng thái lịch hẹn trong tài khoản.'
  },
  {
    id: 4,
    name: 'Khánh Linh',
    service: 'Nhuộm tóc cao cấp',
    rating: 5,
    time: '1 tuần trước',
    comment: 'Màu tóc lên chuẩn và giữ được lâu hơn mong đợi.'
  },
  {
    id: 5,
    name: 'Bảo Châu',
    service: 'Định hình lông mày',
    rating: 5,
    time: '1 tuần trước',
    comment: 'Làm mày rất tự nhiên, form hợp mặt và tư vấn nhiệt tình.'
  },
  {
    id: 6,
    name: 'Thanh Vy',
    service: 'Gội sấy tạo kiểu nhanh',
    rating: 4,
    time: '8 ngày trước',
    comment: 'Phù hợp đi sự kiện gấp, làm nhanh nhưng vẫn gọn đẹp.'
  },
  {
    id: 7,
    name: 'Lan Phương',
    service: 'Massage mô sâu',
    rating: 5,
    time: '9 ngày trước',
    comment: 'Đỡ căng vai gáy rõ rệt sau buổi đầu tiên.'
  },
  {
    id: 8,
    name: 'Mỹ Duyên',
    service: 'Thải độc da đầu',
    rating: 5,
    time: '10 ngày trước',
    comment: 'Da đầu nhẹ và sạch hơn, cảm giác rất thư giãn.'
  },
  {
    id: 9,
    name: 'Gia Hân',
    service: 'Cắt tóc và tạo kiểu',
    rating: 4,
    time: '11 ngày trước',
    comment: 'Cắt đúng kiểu đã trao đổi, chăm sóc khách rất chu đáo.'
  },
  {
    id: 10,
    name: 'Tuyết Nhi',
    service: 'Trang điểm thử cô dâu',
    rating: 5,
    time: '12 ngày trước',
    comment: 'Trang điểm lên ảnh đẹp, tone đúng concept cưới mình muốn.'
  }
];

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

const getServiceImage = (service) => {
  const imageUrl = service?.image_url;

  if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
    return imageUrl.trim();
  }

  return FALLBACK_SERVICE_IMAGE;
};

const toTimestamp = (value) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toVietnameseCategoryLabel = (category) => {
  const key = (category || '').toLowerCase();

  if (key.includes('hair') || key.includes('toc') || key.includes('tóc')) {
    return 'Tóc';
  }

  if (key.includes('nail')) {
    return 'Nail';
  }

  if (key.includes('massage')) {
    return 'Massage';
  }

  if (key.includes('facial') || key.includes('skin') || key.includes('da')) {
    return 'Chăm sóc da';
  }

  if (key.includes('brow') || key.includes('lash') || key.includes('mi')) {
    return 'Mi & Mày';
  }

  if (key.includes('makeup') || key.includes('trang diem') || key.includes('trang điểm')) {
    return 'Trang điểm';
  }

  return category || 'Làm đẹp';
};

function Home({ userLocation = null }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState('');
  const [liveCounter, setLiveCounter] = useState(() => getInitialCounter());
  const [reviewStartIndex, setReviewStartIndex] = useState(0);

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

  useEffect(() => {
    if (customerReviews.length <= REVIEWS_VISIBLE_COUNT) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setReviewStartIndex((current) => (current + 1) % customerReviews.length);
    }, REVIEW_ROTATE_MS);

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

  const categorizedServices = useMemo(() => {
    const categoryCount = normalizedServices.reduce((acc, service) => {
      const categoryKey = (service.category || 'other').toLowerCase();
      acc[categoryKey] = (acc[categoryKey] || 0) + 1;
      return acc;
    }, {});

    const sortedByNewest = [...normalizedServices].sort((a, b) => {
      const timeDiff = toTimestamp(b.created_at) - toTimestamp(a.created_at);
      if (timeDiff !== 0) return timeDiff;
      return Number(b.id || 0) - Number(a.id || 0);
    });

    const sortedByTrending = [...normalizedServices].sort((a, b) => {
      const categoryA = (a.category || 'other').toLowerCase();
      const categoryB = (b.category || 'other').toLowerCase();
      const trendA = (categoryCount[categoryA] || 0) * 1000 + toTimestamp(a.created_at);
      const trendB = (categoryCount[categoryB] || 0) * 1000 + toTimestamp(b.created_at);
      return trendB - trendA;
    });

    const averagePrice =
      normalizedServices.length > 0
        ? normalizedServices.reduce((sum, service) => sum + service.price, 0) / normalizedServices.length
        : 0;

    const sortedByRecommended = [...normalizedServices].sort((a, b) => {
      const scoreA = Math.abs(a.price - averagePrice) + a.duration * 4500;
      const scoreB = Math.abs(b.price - averagePrice) + b.duration * 4500;
      return scoreA - scoreB;
    });

    const usedIds = new Set();
    const pickUnique = (source, limit) => {
      const picked = [];
      for (const service of source) {
        if (picked.length >= limit) break;
        if (usedIds.has(service.id)) continue;
        usedIds.add(service.id);
        picked.push(service);
      }
      return picked;
    };

    const trending = pickUnique(sortedByTrending, 4);
    const recommended = pickUnique(sortedByRecommended, 4);
    const newest = pickUnique(sortedByNewest, 4);

    return { trending, recommended, newest };
  }, [normalizedServices]);

  const categoryChips = useMemo(() => {
    const categories = [
      ...new Set(
        normalizedServices
          .map((service) => service.category)
          .filter((category) => typeof category === 'string' && category.trim() !== '')
      )
    ];

    if (categories.length > 0) {
      return categories.slice(0, 8).map((category) => ({
        value: category,
        label: toVietnameseCategoryLabel(category)
      }));
    }

    return [
      { value: 'nối mi', label: 'Nối mi' },
      { value: 'cắt tóc', label: 'Cắt tóc' },
      { value: 'nail', label: 'Nail' },
      { value: 'massage', label: 'Massage' },
      { value: 'chăm sóc da', label: 'Chăm sóc da' }
    ];
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

  const locationLabel = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    const latitude = Number(userLocation.latitude);
    const longitude = Number(userLocation.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }, [userLocation]);

  const locationCapturedLabel = useMemo(() => {
    if (!userLocation?.capturedAt) {
      return '';
    }

    const parsed = new Date(userLocation.capturedAt);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [userLocation]);

  const rotatingReviews = useMemo(() => {
    if (customerReviews.length <= REVIEWS_VISIBLE_COUNT) {
      return customerReviews;
    }

    return Array.from({ length: REVIEWS_VISIBLE_COUNT }, (_, offset) => {
      const nextIndex = (reviewStartIndex + offset) % customerReviews.length;
      return customerReviews[nextIndex];
    });
  }, [reviewStartIndex]);

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
          <h1>Đặt dịch vụ chăm sóc bản thân tại khu vực của bạn</h1>
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
              <label>Ngày (dd/mm/yyyy)</label>
              <input
                type="date"
                lang="vi"
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
                key={`${category.value}-${category.label}`}
                className="category-pill"
                onClick={() => handleCategoryClick(category.value)}
              >
                {category.label}
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
            <span>Thời lượng trung bình</span>
            <strong>{averageDuration > 0 ? `${averageDuration} phút` : '--'}</strong>
          </article>
          <article>
            <span>Vị trí truy cập</span>
            <strong>{locationLabel || 'Chưa cấp quyền'}</strong>
            {locationLabel && (
              <small className="location-note">
                {userLocation?.accuracy ? `Sai số ~${Math.round(userLocation.accuracy)}m` : 'Vị trí hiện tại'}
                {locationCapturedLabel ? ` - cập nhật ${locationCapturedLabel}` : ''}
              </small>
            )}
          </article>
          <Link to="/services" className="hero-side-cta">
            Xem toàn bộ dịch vụ
          </Link>
        </aside>
      </section>

      <section className="fresha-listing">
        <div className="listing-head">
          <h2>Danh mục sản phẩm</h2>
          <Link to="/services">Xem tất cả</Link>
        </div>

        {loadingServices && <p className="listing-empty">Đang tải danh sách dịch vụ...</p>}
        {!loadingServices && serviceError && <div className="alert alert-error">{serviceError}</div>}
        {!loadingServices &&
          !serviceError &&
          categorizedServices.trending.length === 0 &&
          categorizedServices.recommended.length === 0 &&
          categorizedServices.newest.length === 0 && (
            <p className="listing-empty">Chưa có dịch vụ nào trong hệ thống.</p>
          )}

        {!loadingServices && !serviceError && (
          <div className="listing-groups">
            {[
              { title: 'Xu hướng', data: categorizedServices.trending },
              { title: 'Đề xuất', data: categorizedServices.recommended },
              { title: 'Mới', data: categorizedServices.newest }
            ].map((group) => (
              <div className="listing-group" key={group.title}>
                <h3>{group.title}</h3>
                {group.data.length === 0 ? (
                  <p className="listing-empty">Chưa có dịch vụ phù hợp.</p>
                ) : (
                  <div className="service-market-grid">
                    {group.data.map((service) => (
                      <article className="service-market-card" key={`${group.title}-${service.id}`}>
                        <div className="service-market-image-wrap">
                          <img
                            src={getServiceImage(service)}
                            alt={service.name}
                            className="service-market-image"
                            loading="lazy"
                            onError={(event) => {
                              if (event.currentTarget.src !== FALLBACK_SERVICE_IMAGE) {
                                event.currentTarget.src = FALLBACK_SERVICE_IMAGE;
                              }
                            }}
                          />
                        </div>

                        <div className="service-market-top">
                          <span>{toVietnameseCategoryLabel(service.category)}</span>
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
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="fresha-reviews">
        <div className="fresha-reviews-head">
          <h2>Đánh giá trải nghiệm khách hàng</h2>
          <p>Phản hồi gần đây từ khách đã đặt lịch trên hệ thống.</p>
        </div>

        <div className="reviews-grid">
          {rotatingReviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-top">
                <strong>{review.name}</strong>
                <span>{review.time}</span>
              </div>
              <div className="review-rating">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <p className="review-text">{review.comment}</p>
              <small className="review-service">{review.service}</small>
            </article>
          ))}
        </div>

        <div className="reviews-dots">
          {customerReviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              className={index === reviewStartIndex ? 'reviews-dot active' : 'reviews-dot'}
              onClick={() => setReviewStartIndex(index)}
              aria-label={`Xem đánh giá ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
