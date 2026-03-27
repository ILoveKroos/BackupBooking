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
      <Link to="/admin/dashboard">Tổng quan</Link>
      <Link to="/admin/services">Dịch vụ</Link>
      <Link to="/admin/staff">Nhân viên</Link>
      <Link to="/admin/customers">Khách hàng</Link>
      <Link to="/admin/appointments">Lịch hẹn</Link>
      <Link to="/admin/analytics">Phân tích</Link>
    </>
  );

  const staffLinks = (
    <>
      <Link to="/staff/customers">Khách hàng</Link>
    </>
  );

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Quản trị viên';
    if (user.role === 'staff') return 'Nhân viên';
    return 'Khách hàng';
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo" aria-label="Trang chủ BeautyBook">
            <span className="logo-mark">BB</span>
            <span className="logo-text">
              <strong>BeautyBook</strong>
              <small>Đặt lịch nhanh trong vài giây</small>
            </span>
          </Link>

          <nav className="nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/services">Khám phá dịch vụ</Link>
            {user && user.role === 'customer' && customerLinks}
            {user && user.role === 'admin' && adminLinks}
            {user && user.role === 'staff' && staffLinks}
          </nav>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <div className="user-menu">
                <span className="user-name">{user.name}</span>
                <small>{getRoleLabel()}</small>
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
