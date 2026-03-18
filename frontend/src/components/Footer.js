import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-shell">
        <section className="footer-banner">
          <div className="footer-banner-copy">
            <span>READY TO BOOK</span>
            <h3>Đặt lịch đẹp trong 60 giây</h3>
            <p>
              Chọn dịch vụ, chọn khung giờ và xác nhận lịch hẹn ngay trên hệ thống.
            </p>
          </div>

          <div className="footer-banner-actions">
            <Link to="/services" className="footer-btn-primary">
              Khám phá dịch vụ
            </Link>
            <Link to="/register" className="footer-btn-secondary">
              Tạo tài khoản
            </Link>
          </div>
        </section>

        <section className="footer-grid">
          <article className="footer-card brand-card">
            <div className="brand-row">
              <span className="brand-mark">BB</span>
              <div>
                <h4>BeautyBook</h4>
                <small>Fresha-style booking experience</small>
              </div>
            </div>
            <p>
              Nền tảng booking làm đẹp theo phong cách marketplace,
              tập trung vào tốc độ đặt lịch và trải nghiệm dễ sử dụng.
            </p>
            <div className="social-pills">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
            </div>
          </article>

          <article className="footer-card">
            <h5>Đặt lịch nhanh</h5>
            <div className="footer-links">
              <Link to="/services?q=toc">Hair services</Link>
              <Link to="/services?q=nail">Nail studio</Link>
              <Link to="/services?q=massage">Massage</Link>
              <Link to="/services?q=facial">Facial care</Link>
            </div>
          </article>

          <article className="footer-card">
            <h5>Hỗ trợ</h5>
            <div className="footer-meta">
              <p>Email: info@beautybooking.com</p>
              <p>Hotline: 0123 456 789</p>
              <p>Hỗ trợ: 08:00 - 21:00</p>
            </div>
          </article>
        </section>

        <div className="footer-bottom">
          <p>2026 BeautyBook. Crafted for fast beauty bookings.</p>
          <div>
            <Link to="/services">Services</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
