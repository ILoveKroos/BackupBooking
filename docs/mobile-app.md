# Mobile App

Frontend hiện hỗ trợ bản mobile app theo hướng PWA.

## Android

1. Deploy frontend bằng HTTPS.
2. Mở website trên Chrome/Edge Android.
3. Banner "Cài App BeautyBook" sẽ hiện khi trình duyệt phát sự kiện cài đặt.
4. Bấm "Cài đặt" để thêm BeautyBook vào màn hình chính.

## iOS

1. Mở website bằng Safari trên iPhone hoặc iPad.
2. Nhấn nút Chia sẻ.
3. Chọn "Thêm vào Màn hình chính".
4. Nhấn "Thêm" để mở BeautyBook như một app iOS.

## Ghi Chú Kỹ Thuật

- Cấu hình app nằm ở `frontend/public/manifest.json`.
- Service worker nằm ở `frontend/public/sw.js`.
- Banner cài đặt nằm ở `frontend/src/components/PwaInstallPrompt`.
- Icon PWA gồm `icon-192.png`, `icon-512.png` và `apple-touch-icon.png`.
- PWA cần HTTPS khi deploy thật. Trên localhost, trình duyệt vẫn cho phép kiểm thử.
