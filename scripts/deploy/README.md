# Deploy lên VPS (bookingsalon.tino.page)

VPS **103.142.27.187** · RAM 1GB · Ubuntu 26.04 · **không dùng Docker**

## DNS (làm trước)

Trỏ bản ghi **A** tại panel `tino.page`:

| Tên | Loại | Giá trị |
|-----|------|---------|
| `bookingsalon` | A | `103.142.27.187` |

Kiểm tra:

```bash
ping bookingsalon.tino.page
```

---

## Cách 1 — Một lệnh (nhanh nhất)

SSH vào VPS:

```bash
ssh root@103.142.27.187
```

Chạy:

```bash
apt-get update && apt-get install -y git
git clone --depth 1 https://github.com/ILoveKroos/BackupBooking.git /opt/BackupBooking
cd /opt/BackupBooking/scripts/deploy
cp deploy.env.example deploy.env
nano deploy.env   # sửa mật khẩu JWT/MYSQL nếu muốn, hoặc để trống để tự sinh
chmod +x install.sh update.sh
bash install.sh
```

Thời gian: khoảng **10–20 phút** (npm install + build frontend).

---

## Cách 2 — Chỉ tải script (repo private)

Nếu repo **private**, clone bằng token hoặc SSH key trước, rồi chạy `install.sh` như trên.

---

## Sau khi cài xong

| Mục | URL / lệnh |
|-----|------------|
| Website | https://bookingsalon.tino.page |
| API | https://bookingsalon.tino.page/api/ |
| Log backend | `pm2 logs booking-api` |
| Trạng thái | `pm2 status` |
| Secrets | `scripts/deploy/.secrets.generated` (chmod 600) |

**Tài khoản demo** (nếu seed SQL có sẵn):

- Admin: `admin@beautybook.com` / `Beauty123`
- Khách: `khachhang@beautybook.com` / `Beauty123`

---

## Cập nhật code sau này

```bash
cd /opt/BackupBooking/scripts/deploy
bash update.sh
```

Hoặc nếu cài vào `/opt/bookingsalon`:

```bash
cd /opt/bookingsalon/scripts/deploy && bash update.sh
```

---

## File trong thư mục này

| File | Mô tả |
|------|--------|
| `deploy.env.example` | Biến cấu hình (domain, repo, mật khẩu) |
| `install.sh` | Cài lần đầu: MySQL, Node, PM2, Nginx, SSL |
| `update.sh` | Pull + rebuild + restart |
| `nginx-bookingsalon.conf` | Reverse proxy frontend + API + Socket.io |
| `mysql-low-memory.cnf` | Tune MySQL cho VPS 1GB |

---

## Xử lý lỗi

**Certbot fail** — DNS chưa trỏ đúng IP:

```bash
certbot --nginx -d bookingsalon.tino.page
```

**502 Bad Gateway**:

```bash
pm2 restart booking-api
pm2 logs booking-api --lines 100
```

**CORS error** — kiểm tra `backend/.env`:

```env
FRONTEND_URL=https://bookingsalon.tino.page
```

**VPS treo** — kiểm tra RAM/swap:

```bash
free -h
```

---

## Push script lên GitHub

Trên máy local (thư mục dự án):

```bash
git add scripts/deploy/
git commit -m "Add VPS deploy scripts for bookingsalon.tino.page"
git push origin main
```

Sau đó trên VPS clone repo và chạy `install.sh`.
