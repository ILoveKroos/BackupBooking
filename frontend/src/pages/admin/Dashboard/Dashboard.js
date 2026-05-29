import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import dashboardService from '../../../services/dashboardService';
import connectDashboardRealtime from '../../../services/dashboardRealtimeService';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const APPOINTMENT_STATUS_META = {
  pending: {
    label: 'Chờ xác nhận',
    color: '#c69244',
    softColor: '#f7ead7'
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: '#5f8d51',
    softColor: '#e7f0df'
  },
  completed: {
    label: 'Hoàn thành',
    color: '#0f766e',
    softColor: '#dcefeb'
  },
  cancelled: {
    label: 'Đã hủy',
    color: '#b86a55',
    softColor: '#f3ded6'
  }
};

const pad2 = (value) => String(value).padStart(2, '0');

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

const getStatusMeta = (status) => {
  const key = String(status || '').toLowerCase();
  return APPOINTMENT_STATUS_META[key] || {
    label: status || 'Khác',
    color: '#7c887d',
    softColor: '#eef1ec'
  };
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const formatDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('vi-VN');
};

const formatDelta = (delta) => {
  if (delta === null || typeof delta === 'undefined') {
    return 'Chưa đủ dữ liệu so sánh';
  }

  return `${delta >= 0 ? '+' : ''}${Number(delta).toFixed(1)}% so với kỳ trước`;
};

const getPeriodHint = (period) => {
  if (period === 'day') return 'Trend theo giờ trong ngày';
  if (period === 'year') return 'Trend theo tháng trong năm';
  return 'Trend theo ngày trong tháng';
};

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState(null);
  const [activePanel, setActivePanel] = useState('trend');
  const realtimeStatusRef = useRef('connecting');
  const refreshTimerRef = useRef(null);

  const overviewParams = useMemo(() => {
    const params = { period, year: selectedYear };

    if (period === 'day') {
      params.date = selectedDate;
    }

    if (period === 'month') {
      params.month = selectedMonth;
    }

    return params;
  }, [period, selectedDate, selectedMonth, selectedYear]);

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const response = await dashboardService.getOverview(overviewParams);
        setOverview(response.data.data);
        setError('');
      } catch (err) {
        setError('Không thể tải dữ liệu dashboard.');
        console.error(err);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [overviewParams]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    let socket = null;
    let cancelled = false;

    connectDashboardRealtime({
      onStatus: (status) => {
        realtimeStatusRef.current = status;
        setRealtimeStatus(status);
      },
      onUpdate: (payload) => {
        setLastRealtimeEvent(payload);
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = window.setTimeout(() => {
          fetchDashboardData({ silent: true });
        }, 250);
      }
    })
      .then((connectedSocket) => {
        if (cancelled) {
          connectedSocket.disconnect();
          return;
        }
        socket = connectedSocket;
      })
      .catch(() => {
        if (!cancelled) {
          setRealtimeStatus('fallback');
        }
      });

    const fallbackInterval = window.setInterval(() => {
      if (realtimeStatusRef.current !== 'connected') {
        fetchDashboardData({ silent: true });
      }
    }, 30000);

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimerRef.current);
      window.clearInterval(fallbackInterval);
      socket?.disconnect();
    };
  }, [fetchDashboardData]);

  const summary = overview?.summary || {};
  const trendRows = overview?.trend || [];
  const favoriteServices = overview?.favorite_services || [];
  const recentBookings = overview?.recent_bookings || [];
  const statusRows = (overview?.status_breakdown || []).map((item) => ({
    ...item,
    count: Number(item.count || 0),
    percent: Number(item.percent || 0),
    ...getStatusMeta(item.status)
  }));
  const completedRate = statusRows.find((item) => item.status === 'completed')?.percent || 0;
  const cancelledRate = statusRows.find((item) => item.status === 'cancelled')?.percent || 0;
  const favoriteService = favoriteServices[0];
  const getFavoriteServiceLimit = (p) => {
    if (p === 'day') return 3;
    if (p === 'year') return 10;
    return 5;
  };
  const favoriteServiceLimit = getFavoriteServiceLimit(period);
  const visibleFavoriteServices = favoriteServices.slice(0, favoriteServiceLimit);
  const visibleRecentBookings = recentBookings.slice(0, 5);
  const trendBookingValues = trendRows.map((item) => Number(item.bookings || 0));
  const trendAverageValue =
    trendBookingValues.length > 0
      ? trendBookingValues.reduce((sum, value) => sum + value, 0) / trendBookingValues.length
      : 0;
  const shouldShowTrendAverage = period === 'month' && trendAverageValue > 0;
  const panelTabs = [
    {
      key: 'trend',
      label: 'Số lượt booking',
      value: `${Number(summary.active_bookings || 0).toLocaleString('vi-VN')} lịch`
    },
    {
      key: 'status',
      label: 'Trạng thái',
      value: `${completedRate.toFixed(1)}% hoàn thành`
    },
    {
      key: 'services',
      label: 'Dịch vụ ưa thích',
      value: favoriteService?.name || 'Chưa có dữ liệu'
    },
    {
      key: 'recent',
      label: 'Đơn gần đây',
      value: `${visibleRecentBookings.length} đơn`
    }
  ];

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#34423c',
          font: { size: 12, weight: '700' },
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: '#21322d',
        titleColor: '#fdfefa',
        bodyColor: '#fdfefa',
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(123, 142, 134, 0.14)' },
        ticks: { color: '#687568', maxRotation: 0, autoSkip: true }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(123, 142, 134, 0.16)' },
        ticks: { color: '#687568', precision: 0 }
      }
    }
  };

  const trendChartData = {
    labels: trendRows.map((item) => item.label),
    datasets: [
      {
        label: 'Booking',
        data: trendBookingValues,
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.12)',
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        tension: 0.34,
        fill: true
      },
      shouldShowTrendAverage
        ? {
            label: 'Trung bình ngày',
            data: trendRows.map(() => Number(trendAverageValue.toFixed(1))),
            borderColor: '#c69244',
            backgroundColor: 'rgba(198, 146, 68, 0.16)',
            borderDash: [6, 5],
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
            fill: false
          }
        : null
    ].filter(Boolean)
  };

  const statusChartData = {
    labels: statusRows.map((item) => item.label),
    datasets: [
      {
        data: statusRows.map((item) => item.count),
        backgroundColor: statusRows.map((item) => item.color),
        borderColor: '#fdfefa',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const serviceChartData = {
    labels: visibleFavoriteServices.map((item) => item.name),
    datasets: [
      {
        label: 'Số lượt đặt',
        data: visibleFavoriteServices.map((item) => Number(item.booking_count || 0)),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        borderWidth: 2.5,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: '#0000FF',
        pointBorderColor: '#fdfefa',
        pointBorderWidth: 2,
        tension: 0.28,
        fill: true
      }
    ]
  };

  const serviceChartOptions = {
    ...chartBaseOptions,
    plugins: {
      ...chartBaseOptions.plugins,
      legend: { display: false },
      tooltip: {
        ...chartBaseOptions.plugins.tooltip,
        callbacks: {
          title: (items) => visibleFavoriteServices[items[0]?.dataIndex]?.name || '',
          label: (context) => {
            const service = visibleFavoriteServices[context.dataIndex];
            return `Số lượt đặt: ${Number(service?.booking_count || 0).toLocaleString('vi-VN')} lượt`;
          }
        }
      }
    },
    scales: {
      x: {
        ...chartBaseOptions.scales.x,
        grid: { display: true, color: 'rgba(123, 142, 134, 0.12)', borderDash: [5, 5] },
        title: {
          display: false,
          text: 'Tên dịch vụ',
          color: '#34423c',
          font: { size: 12, weight: '700' }
        },
        ticks: {
          ...chartBaseOptions.scales.x.ticks,
          display: false
        }
      },
      y: {
        ...chartBaseOptions.scales.y,
        grid: { display: true, color: 'rgba(123, 142, 134, 0.12)', borderDash: [5, 5] },
        title: {
          display: true,
          text: 'Số lượt đặt',
          color: '#34423c',
          font: { size: 12, weight: '700' }
        },
        beginAtZero: true
      }
    }
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#21322d',
        titleColor: '#fdfefa',
        bodyColor: '#fdfefa',
        padding: 10,
        callbacks: {
          label: (context) => {
            const row = statusRows[context.dataIndex];
            return `${row.label}: ${row.count.toLocaleString('vi-VN')} lịch (${row.percent.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-title-block">
          <p className="dashboard-kicker">Admin Center</p>
          <h1>Dashboard điều hành</h1>
          {(realtimeStatus !== 'connected' || lastRealtimeEvent?.type) && (
            <div className={`dashboard-realtime-status status-${realtimeStatus}`}>
              {realtimeStatus === 'connected' ? null : 'Đang dùng cập nhật định kỳ'}
              {lastRealtimeEvent?.type ? <small>{lastRealtimeEvent.type}</small> : null}
            </div>
          )}
        </div>

        <div className="dashboard-filter-panel" aria-label="Bộ lọc dashboard">
          <div className="dashboard-period-tabs">
            {[
              ['day', 'Ngày'],
              ['month', 'Tháng'],
              ['year', 'Năm']
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={period === key ? 'active' : ''}
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {period === 'day' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          )}

          {period === 'month' && (
            <input
              type="month"
              value={`${selectedYear}-${pad2(selectedMonth)}`}
              onChange={(event) => {
                const [yearValue, monthValue] = event.target.value.split('-').map(Number);
                setSelectedYear(yearValue);
                setSelectedMonth(monthValue);
              }}
            />
          )}

          {period === 'year' && (
            <input
              type="number"
              min="2020"
              max="2100"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value) || new Date().getFullYear())}
            />
          )}
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="dashboard-overview-grid">
        <button
          type="button"
          className={`dashboard-total-card dashboard-metric-card ${activePanel === 'trend' ? 'is-active' : ''}`}
          onClick={() => setActivePanel('trend')}
        >
          <span>Tổng booking</span>
          <strong>{Number(summary.total_bookings || 0).toLocaleString('vi-VN')}</strong>
          <small>{overview?.period?.label || 'Kỳ đang xem'}</small>
          <span className={`dashboard-delta ${summary.booking_delta_percent >= 0 ? 'positive' : 'negative'}`}>
            {formatDelta(summary.booking_delta_percent)}
          </span>
        </button>

        <div className="dashboard-kpi-stack">
          <button
            type="button"
            className={`dashboard-metric-card ${activePanel === 'trend' ? 'is-active' : ''}`}
            onClick={() => setActivePanel('trend')}
          >
            <span>Doanh thu hoàn thành</span>
            <strong>{formatMoney(summary.total_revenue)}</strong>
            <small>{formatDelta(summary.revenue_delta_percent)}</small>
          </button>
          <button
            type="button"
            className={`dashboard-metric-card ${activePanel === 'status' ? 'is-active' : ''}`}
            onClick={() => setActivePanel('status')}
          >
            <span>Hoàn thành</span>
            <strong>{completedRate.toFixed(1)}%</strong>
            <small>{Number(summary.completed_bookings || 0).toLocaleString('vi-VN')} lịch</small>
          </button>
          <button
            type="button"
            className={`dashboard-metric-card ${activePanel === 'status' ? 'is-active' : ''}`}
            onClick={() => setActivePanel('status')}
          >
            <span>Đã hủy</span>
            <strong>{cancelledRate.toFixed(1)}%</strong>
            <small>{Number(summary.cancelled_bookings || 0).toLocaleString('vi-VN')} lịch</small>
          </button>
          <button
            type="button"
            className={`dashboard-metric-card ${activePanel === 'services' ? 'is-active' : ''}`}
            onClick={() => setActivePanel('services')}
          >
            <span>Dịch vụ ưa thích</span>
            <strong>{favoriteService?.name || 'Chưa có dữ liệu'}</strong>
            <small>
              {favoriteService ? `${favoriteService.favorite_score.toFixed(1)}/100 điểm` : 'Chờ thêm booking'}
            </small>
          </button>
        </div>
      </section>

      <section className="dashboard-insight-shell">
        <div className="dashboard-insight-toolbar" aria-label="Điều khiển dữ liệu dashboard">
          {panelTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`dashboard-insight-tab${activePanel === tab.key ? ' is-active' : ''}`}
              onClick={() => setActivePanel(tab.key)}
              aria-pressed={activePanel === tab.key}
              title={tab.value}
            >
              <span>{tab.label}</span>
              <small>{tab.value}</small>
            </button>
          ))}
        </div>

        <article className="chart-card dashboard-insight-card">
          {activePanel === 'trend' && (
            <>
              <div className="chart-card-head">
                <div>
                  <h3>Số lượt booking</h3>
                  <p>{getPeriodHint(period)}</p>
                </div>
              </div>
              <div className="dashboard-trend-layout">
                <div className="chart-canvas-wrap dashboard-primary-chart">
                  <Line data={trendChartData} options={chartBaseOptions} />
                </div>

                <aside className="trend-favorite-rankings">
                  <div className="trend-favorite-head">
                    <div>
                      <h4>Top {favoriteServiceLimit} dịch vụ được ưa thích</h4>
                    </div>
                  </div>

                  {visibleFavoriteServices.length > 0 ? (
                    <table className="trend-favorite-table">
                      <thead>
                        <tr>
                          <th>Top</th>
                          <th>Dịch vụ</th>
                          <th>Lượt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleFavoriteServices.map((service, index) => (
                          <tr key={service.id || service.name}>
                            <td>#{index + 1}</td>
                            <td title={service.name}>{service.name}</td>
                            <td>{Number(service.booking_count || 0).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="trend-favorite-empty">Chưa có booking dịch vụ trong kỳ này.</div>
                  )}
                </aside>
              </div>
            </>
          )}

          {activePanel === 'status' && (
            <>
              <div className="chart-card-head">
                <div>
                  <h3>Tỷ lệ trạng thái</h3>
                  <p>Hoàn thành và hủy được tính trên tổng lịch trong kỳ</p>
                </div>
              </div>

              {statusRows.length > 0 ? (
                <div className="status-chart-layout">
                  <div className="chart-canvas-wrap status-chart-wrap">
                    <Doughnut data={statusChartData} options={statusChartOptions} />
                  </div>
                  <div className="status-legend">
                    {statusRows.map((item) => (
                      <div className="status-legend-row" key={item.status || item.label}>
                        <span style={{ backgroundColor: item.color }} aria-hidden="true" />
                        <div>
                          <strong>{item.label}</strong>
                          <small>
                            {item.count.toLocaleString('vi-VN')} lịch · {item.percent.toFixed(1)}%
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chart-empty-state">Chưa có dữ liệu trạng thái trong kỳ này.</div>
              )}
            </>
          )}

          {activePanel === 'services' && (
            <>
              <div className="chart-card-head">
                <div>
                  <h3>Biểu đồ đường số lượt đặt theo từng dịch vụ</h3>
                  <p>Số lượt đặt lịch của các dịch vụ trong kỳ </p>
                </div>
              </div>
              {visibleFavoriteServices.length > 0 ? (
                <>
                  <div className="chart-canvas-wrap service-score-wrap" style={{ height: '320px', marginBottom: '24px' }}>
                    <Line data={serviceChartData} options={serviceChartOptions} />
                  </div>
                  
                  <div className="services-ranking-section">
                    <h4 className="services-ranking-title" style={{ margin: '24px 0 12px', fontSize: '15px', color: '#21322d', fontWeight: '700' }}>
                      Bảng xếp hạng chi tiết ({visibleFavoriteServices.length} dịch vụ)
                    </h4>
                    <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {visibleFavoriteServices.map((srv, index) => {
                        const rankColors = [
                          { border: '1px solid #0f766e', bg: '#dcefeb', color: '#0f766e' },
                          { border: '1px solid #c69244', bg: '#f7ead7', color: '#c69244' },
                          { border: '1px solid #b86a55', bg: '#f3ded6', color: '#b86a55' }
                        ];
                        const rankStyle = rankColors[index] || { border: '1px solid #7c887d', bg: '#eef1ec', color: '#7c887d' };
                        return (
                          <div 
                            key={srv.id} 
                            style={{ 
                              background: '#fdfefa', 
                              border: '1px solid rgba(123, 142, 134, 0.16)', 
                              borderRadius: '12px', 
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span 
                                style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '800', 
                                  padding: '2px 8px', 
                                  borderRadius: '20px',
                                  ...rankStyle
                                }}
                              >
                                TOP {index + 1}
                              </span>
                              <strong style={{ fontSize: '13px', color: '#0f766e' }} title={overview?.favorite_formula}>
                                {srv.favorite_score.toFixed(1)}đ
                              </strong>
                            </div>
                            <h5 style={{ margin: '4px 0 2px', fontSize: '14px', fontWeight: '700', color: '#34423c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {srv.name}
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: '#687568' }}>
                              <span>Lượt đặt: <strong>{srv.booking_count}</strong> ({srv.completed_count} thành công)</span>
                              <span>Doanh thu: <strong>{formatMoney(srv.revenue)}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="chart-empty-state">Chưa có booking dịch vụ trong kỳ này.</div>
              )}
            </>
          )}


          {activePanel === 'recent' && (
            <>
              <div className="chart-card-head">
                <div>
                  <h3>Đơn gần đây</h3>
                  <p>Hiển thị thời gian và giá trị đơn trong kỳ đang chọn</p>
                </div>
              </div>

              {visibleRecentBookings.length > 0 ? (
                <div className="recent-booking-list">
                  {visibleRecentBookings.map((booking) => {
                    const meta = getStatusMeta(booking.status);
                    return (
                      <div className="recent-booking-row" key={booking.id}>
                        <div>
                          <strong>{booking.service_name}</strong>
                          <small>
                            {formatDate(booking.appointment_date)} · {booking.appointment_time} ·{' '}
                            {booking.customer_name || 'Khách hàng'}
                          </small>
                        </div>
                        <div className="recent-booking-value">
                          <span style={{ backgroundColor: meta.softColor, color: meta.color }}>{meta.label}</span>
                          <strong>{formatMoney(booking.total_amount)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="chart-empty-state">Chưa có đơn nào trong kỳ đang chọn.</div>
              )}
            </>
          )}
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
