import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const customerLinks = (
    <>
      <Link to="/my-appointments">Lịch của tôi</Link>
      <Link to="/profile">Hồ sơ</Link>
    </>
  );

  const adminLinks = (
    <>
      <Link to="/admin/dashboard">Dashboard</Link>
      <Link to="/admin/services">Dịch vụ</Link>
      <Link to="/admin/staff">Nhân viên</Link>
      <Link to="/admin/appointments">Lịch hẹn</Link>
      <Link to="/admin/analytics">Phân tích</Link>
    </>
  );

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo" aria-label="BeautyBook home">
            <span className="logo-mark">BB</span>
            <span className="logo-text">
              <strong>BeautyBook</strong>
              <small>Book services in seconds</small>
            </span>
          </Link>

          <nav className="nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/services">Khám phá dịch vụ</Link>
            {user && user.role === 'customer' && customerLinks}
            {user && user.role === 'admin' && adminLinks}
          </nav>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <div className="user-menu">
                <span className="user-name">{user.name}</span>
                <small>{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</small>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
