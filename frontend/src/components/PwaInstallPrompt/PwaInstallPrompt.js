import React, { useEffect, useMemo, useState } from 'react';
import './PwaInstallPrompt.css';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const isDismissedRecently = () => {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION_MS;
};

const isAppInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const isIosDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform;
  return /iphone|ipad|ipod/.test(userAgent) || (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
};

const PhoneIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="pwa-svg-icon"
    aria-hidden="true"
  >
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M10 18h4" />
    <path d="M9 6h6" />
  </svg>
);

function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installMode, setInstallMode] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const isIos = useMemo(() => typeof window !== 'undefined' && isIosDevice(), []);

  useEffect(() => {
    if (isDismissedRecently() || isAppInstalled()) {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallMode('android');
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isIos) {
      setInstallMode('ios');
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIos]);

  const handleInstallClick = async () => {
    if (installMode === 'ios') {
      setIsVisible(false);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const isIosInstall = installMode === 'ios';

  return (
    <section className="pwa-install-banner" aria-label="Cài đặt ứng dụng BeautyBook">
      <div className="pwa-install-content">
        <div className="pwa-icon-container">
          <PhoneIcon />
        </div>
        <div className="pwa-text-details">
          <span className="pwa-kicker">{isIosInstall ? 'iPhone / iPad' : 'Android / Mobile'}</span>
          <h4>Cài App BeautyBook</h4>
          <p>
            Mở BeautyBook như một ứng dụng trên điện thoại để đặt lịch, xem voucher và theo dõi lịch hẹn nhanh hơn.
          </p>
        </div>
      </div>

      {isIosInstall && (
        <ol className="pwa-ios-steps">
          <li>Mở trang bằng Safari nếu đang dùng trình duyệt khác.</li>
          <li>Nhấn nút Chia sẻ trong Safari.</li>
          <li>Chọn Thêm vào Màn hình chính.</li>
          <li>Nhấn Thêm để dùng BeautyBook như app iOS.</li>
        </ol>
      )}

      <div className="pwa-action-buttons">
        <button type="button" className="btn-pwa-dismiss" onClick={handleDismiss}>
          Để sau
        </button>
        <button type="button" className="btn-pwa-install" onClick={handleInstallClick}>
          {isIosInstall ? 'Đã hiểu' : 'Cài đặt'}
        </button>
      </div>
    </section>
  );
}

export default PwaInstallPrompt;
