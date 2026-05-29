# DESIGN.md

## Tổng Quan

BeautyBook là ứng dụng web đặt lịch dịch vụ làm đẹp. Frontend được xây dựng bằng React, tập trung vào hai nhóm trải nghiệm chính:

- Khách hàng: tìm dịch vụ, xem chi tiết, đặt lịch, thanh toán, theo dõi lịch hẹn, dùng voucher và trò chuyện với AI hỗ trợ.
- Vận hành nội bộ: admin, thu ngân và nhân viên dịch vụ quản lý lịch hẹn, dịch vụ, khách hàng, voucher, nhân sự, lịch làm việc và số liệu kinh doanh.

Thiết kế hiện tại đi theo hướng hiện đại, sáng, mềm, nhiều bề mặt trắng, màu thương hiệu xanh teal và các điểm nhấn xanh dương hoặc coral tùy màn hình. Các trang khách hàng có cảm giác marketplace đặt dịch vụ, còn các trang admin/staff ưu tiên mật độ thông tin, bảng dữ liệu, bộ lọc và trạng thái xử lý.

## Nền Tảng Frontend

- Framework: React 18.
- Điều hướng: React Router v6, định tuyến theo vai trò trong `frontend/src/App.js`.
- Gọi API: Axios qua các service trong `frontend/src/services`.
- Biểu đồ: Chart.js và `react-chartjs-2` cho dashboard/analytics.
- Realtime: `socket.io-client` dùng cho dashboard admin.
- PWA: có `manifest.json`, `sw.js`, prompt cài đặt và điều chỉnh giao diện khi chạy standalone.
- Styling: CSS thuần theo từng component/page, có biến toàn cục trong `frontend/src/App.css`.

## Kiến Trúc Màn Hình

### Public

- `/`: trang chủ với hero tìm kiếm dịch vụ, chọn ngày, danh mục nhanh, số lượt đặt lịch, vị trí truy cập, danh sách dịch vụ nổi bật và carousel đánh giá.
- `/services`: marketplace dịch vụ, có tìm kiếm, lọc danh mục, lọc thời lượng, lọc giá và sắp xếp.
- `/services/:id`: chi tiết dịch vụ.
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/zalo-callback`: nhóm xác thực.
- `/payment-result`, `/payment-transfer/:paymentId`, `/payment-bill/:paymentId`: nhóm kết quả/chứng từ thanh toán.

### Customer

- `/booking/:serviceId`: luồng đặt lịch nhiều dịch vụ, chọn ngày, chọn giờ, chọn nhân viên, voucher, phương thức thanh toán và tóm tắt chi phí.
- `/my-appointments`: danh sách lịch của khách, trạng thái xác nhận, yêu cầu hủy, thanh toán lại, xem bill và đánh giá nhân viên.
- `/my-vouchers`: voucher cá nhân.
- `/profile`: hồ sơ, vai trò, thông tin cá nhân và avatar.

### Admin

- `/admin/dashboard`: KPI, biểu đồ booking/doanh thu/dịch vụ phổ biến và trạng thái realtime.
- `/admin/services`: quản lý dịch vụ.
- `/admin/staff`: quản lý nhân viên.
- `/admin/staff-leave`: duyệt nghỉ phép.
- `/admin/customers`: quản lý khách hàng.
- `/admin/vouchers`: quản lý voucher.
- `/admin/appointments`: điều phối lịch hẹn, xác nhận/hủy, thanh toán, xuất Excel.
- `/admin/schedule`: lịch nhân viên.
- `/admin/analytics`: phân tích dữ liệu.

### Staff

- `/staff/dashboard`: với nhân viên dịch vụ là lịch được phân công, thao tác xác nhận, hoàn thành, yêu cầu hủy và xin nghỉ phép.
- `/staff/dashboard` với thu ngân dùng màn hình quản lý lịch hẹn.
- `/staff/customers`: thu ngân xem/quản lý khách hàng.

## Ngôn Ngữ Thiết Kế

### Typography

Frontend dùng Google Fonts:

- `Be Vietnam Pro`: font chính cho nội dung tiếng Việt.
- `Plus Jakarta Sans`: hỗ trợ giao diện hiện đại, dễ đọc.
- `Manrope`: dùng cho headline lớn, hero và các tiêu đề cần nhấn mạnh.

Nguyên tắc dùng chữ:

- Headline khách hàng lớn, rõ, có nhịp marketplace.
- Trang admin/staff dùng tiêu đề ngắn, chữ nhỏ hơn, ưu tiên quét nhanh.
- Form, bảng và filter giữ cỡ chữ 12-15px, đủ dày để đọc tốt trên mobile.

### Màu Sắc

Token chính đang nằm trong `frontend/src/App.css`:

| Token | Giá trị | Vai trò |
| --- | --- | --- |
| `--bg-main` | `#f8fafc` | nền tổng thể |
| `--bg-soft` | `#eef3f9` | nền chuyển nhẹ |
| `--surface` | `#ffffff` | card, panel, form |
| `--line` | `#d9e2ef` | border |
| `--text-main` | `#12223b` | chữ chính |
| `--text-muted` | `#51607a` | chữ phụ |
| `--brand` | `#0f766e` | thương hiệu, trạng thái active |
| `--brand-strong` | `#0a4f4a` | hover/nhấn mạnh |
| `--accent` | `#ff7f50` | điểm nhấn coral |
| `--danger` | `#dc2626` | lỗi/hủy |
| `--success` | `#15803d` | thành công |
| `--info` | `#1d4ed8` | thông tin/phụ trợ |

Các trang có biến thể:

- Trang chủ dùng thêm xanh dương cho search hero và liên kết dịch vụ.
- Trang dịch vụ dùng nền gradient teal/coral để tạo cảm giác marketplace.
- Trang booking dùng teal mạnh, panel kính mờ và các trạng thái chọn rõ ràng.
- Trang admin/staff dùng nền trắng, border mỏng, KPI card và bảng dữ liệu.

### Layout

- Container chính tối đa `1240px`, căn giữa, padding responsive bằng `clamp`.
- Layout khách hàng dùng grid/card với khoảng cách thoáng.
- Layout booking dùng 2 cột: form chính và sidebar tóm tắt sticky.
- Layout admin/staff dùng hero vận hành, stat cards, toolbar filter và table shell.
- Mobile chuyển về 1 cột, ẩn footer khi có bottom nav, tăng kích thước input để tránh zoom iOS.

## Component Chính

### Header

`Header` là sticky header dạng glass panel:

- Logo BeautyBook và tagline.
- Link public: Trang chủ, Dịch vụ.
- Role menu theo user: admin, staff, customer.
- User menu gồm avatar, tên, vai trò.
- Notification menu có badge, danh sách thông báo và quick action.
- Mobile dùng hamburger mở panel điều hướng.
- Khi scroll, header thu gọn padding, bo góc và bóng đổ.

### Bottom Navigation

`BottomNav` chỉ hiện trên mobile khi đã đăng nhập:

- Customer: Home, Dịch vụ, Đặt lịch, Voucher, Lịch hẹn.
- Admin: Dashboard, Lịch, Lịch NV, Nhân viên, Khách.
- Staff: Dashboard, Lịch, Tài khoản.

Bottom nav cố định dưới màn hình, có safe-area cho thiết bị iOS và trạng thái active bằng thanh màu brand.

### Buttons, Form, Alert, Card

Các style toàn cục:

- `.btn-primary`: gradient teal, dùng cho CTA chính.
- `.btn-secondary`: xanh dương cho hành động phụ.
- `.btn-danger`: đỏ cho hủy/xóa.
- `.btn-success`: xanh thành công.
- `.form-group`: label đậm, input bo góc, focus ring màu brand.
- `.alert-success`, `.alert-error`, `.alert-info`: nền pha màu theo trạng thái.
- `.card`: surface trắng, border, shadow mềm.

### Service Card

Thẻ dịch vụ dùng ở trang chủ và marketplace:

- Ảnh tỷ lệ `16 / 10`, `object-fit: cover`.
- Badge danh mục và collection.
- Tên, mô tả, giá, thời lượng.
- CTA chi tiết và đặt lịch/tìm tương tự.
- Fallback ảnh từ Unsplash nếu ảnh dịch vụ lỗi.

### Booking Form

Trang booking là luồng có nhiều bước trong một màn hình:

- Chọn nhiều dịch vụ bằng tab danh mục, subcategory và bảng dịch vụ compact.
- Danh sách dịch vụ đã chọn hiển thị dạng chip.
- Chọn ngày và khung giờ phổ biến.
- Slot bận/quá giờ bị disabled bằng pattern xám.
- Chọn nhân viên hoặc để hệ thống tự sắp xếp.
- Voucher, AI chống hủy lịch, phương thức thanh toán và tổng tiền nằm ở sidebar.
- Submit button thay đổi nội dung theo phương thức thanh toán: tại tiệm, VietQR, VNPay.

### Admin/Staff Data UI

Các màn hình vận hành dùng mẫu chung:

- Hero ngắn với mô tả nghiệp vụ.
- Stat cards theo trạng thái.
- Filter buttons có count.
- Table có `cell-stack`, status pill, payment stack, action buttons.
- Modal xác nhận cho hủy lịch/yêu cầu hủy.
- Xuất Excel cho lịch hẹn admin.

Trạng thái lịch hẹn nên tiếp tục dùng hệ màu:

- Pending: cảnh báo/vàng.
- Confirmed: trung tính hoặc brand.
- Completed: success.
- Cancelled: danger.
- Cancellation request: warning nổi bật.

### ChatBot

ChatBot là floating widget chỉ hiển thị khi user đã đăng nhập:

- Toggle button cố định.
- Chat panel có header, trạng thái online, nội dung message, markdown nhẹ, bảng, list.
- Suggestion buttons, quick actions sau phản hồi bot.
- Booking card tóm tắt nếu bot tạo/đề xuất lịch.
- Tool indicator cho các thao tác AI như kiểm tra lịch, tạo booking, lấy voucher.

### Consent Và PWA

- Consent banner xin quyền cookie và vị trí.
- Vị trí được đưa về trang chủ để hiển thị tọa độ/trạng thái truy cập.
- PWA install prompt và standalone mode có style riêng.
- Mobile có safe area, touch target tối thiểu 44px và input 16px.

## Luồng UX Chính

### Tìm Và Đặt Dịch Vụ

1. Người dùng vào trang chủ.
2. Nhập từ khóa dịch vụ và ngày mong muốn.
3. Chuyển sang `/services` với query params.
4. Lọc/sắp xếp dịch vụ theo nhu cầu.
5. Vào chi tiết hoặc bấm đặt lịch.
6. Chọn thêm dịch vụ, ngày, giờ, nhân viên, voucher và thanh toán.
7. Tạo lịch, sau đó chuyển tới thanh toán online hoặc lịch của tôi.

### Theo Dõi Lịch Khách Hàng

1. Khách xem `/my-appointments`.
2. Lọc theo tất cả, chờ xác nhận, đã xác nhận, chờ thanh toán, chờ hủy, hoàn thành.
3. Có thể hủy/yêu cầu hủy tùy trạng thái.
4. Có thể mở lại thanh toán online hoặc xem bill.
5. Khi hoàn thành, khách đánh giá nhân viên.

### Điều Phối Admin/Thu Ngân

1. Admin/thu ngân xem thống kê trạng thái.
2. Lọc lịch theo trạng thái.
3. Xác nhận/hủy/giữ lịch theo request.
4. Xác nhận thanh toán VietQR nếu cần.
5. Xuất Excel phục vụ đối soát.

### Nhân Viên Dịch Vụ

1. Nhân viên xem lịch được giao.
2. Xác nhận nhận lịch hoặc hủy/yêu cầu hủy.
3. Đánh dấu hoàn thành dịch vụ.
4. Xem lịch sử nghỉ phép và gửi yêu cầu nghỉ phép.

## Responsive Và Accessibility

Đã có:

- Header mobile với hamburger và `aria-expanded`.
- Bottom nav mobile có `aria-current`.
- Modal có `role="dialog"` và `aria-modal` ở nhiều nơi.
- Tab danh mục booking dùng `role="tablist"` và `aria-selected`.
- Touch target mobile tối thiểu 44px.
- `prefers-reduced-motion` cho carousel review.
- Focus ring rõ trên form control.

Cần duy trì khi mở rộng:

- Không để table bị mất nội dung trên mobile, luôn có wrapper scroll ngang.
- Button quan trọng cần disabled/loading state rõ ràng.
- Modal cần focus management tốt hơn nếu bổ sung logic accessibility.
- Icon dạng text/emoji nên dần được chuẩn hóa bằng một icon set thống nhất.

## Trạng Thái UI Cần Luôn Có

Mỗi màn hình dữ liệu nên có đủ:

- Loading: dùng `.loading` hoặc skeleton nếu dữ liệu lớn.
- Empty: thông báo rõ không có dữ liệu.
- Error: `.alert-error` với nội dung từ API nếu có.
- Success: `.alert-success` sau thao tác tạo/cập nhật.
- Disabled: khi đang xử lý hoặc khi user không có quyền.
- Optimistic/refresh: nếu cập nhật realtime hoặc fetch lại sau action.

## Quy Ước Khi Phát Triển Thêm

- Ưu tiên dùng token màu trong `App.css` thay vì hard-code thêm màu mới.
- Giữ container chính cùng giới hạn `1240px`.
- Trang khách hàng có thể dùng card thoáng, ảnh dịch vụ và CTA rõ.
- Trang admin/staff nên giữ layout dày thông tin: toolbar, filter, bảng, status pill.
- Component mới nên có responsive breakpoint cho `768px` và `480px`.
- Các flow liên quan tiền/lịch hẹn phải hiển thị trạng thái xử lý, lỗi và xác nhận rõ.
- Form cần label đầy đủ, input focus rõ, thông báo lỗi gần trường nhập.
- Khi thêm trạng thái lịch/thanh toán mới, cập nhật đồng bộ badge, filter, bảng và mô tả trong cả customer/admin/staff.

## Điểm Cần Chuẩn Hóa Tiếp

- Chuẩn hóa encoding UTF-8 cho toàn bộ source để tránh lỗi hiển thị tiếng Việt.
- Gom các biến màu, radius, shadow, spacing dùng lại vào một hệ token rõ hơn.
- Thay icon text/emoji trong bottom nav, chatbot, export bằng icon thống nhất.
- Hạn chế inline style trong modal/bảng, chuyển về CSS module/page CSS.
- Đồng bộ phong cách hero giữa Home, Services, Booking và Admin để brand nhất quán hơn.
- Tách các pattern lặp lại như filter buttons, stat cards, status pills, modal confirm và table shell thành component dùng chung.
