const db = require('../../config/db');

// Map template IDs to readable mock text messages for demonstration/simulation
const MOCK_TEMPLATE_MESSAGES = {
  'booking_created': (data) => `[Zalo ZNS] Kính chào ${data.customerName}, lịch hẹn của bạn tại BeautyBook đã được tạo thành công vào lúc ${data.time} ngày ${data.date}. Nhân viên phục vụ: ${data.staffName}. Trạng thái: Chờ xác nhận.`,
  'booking_confirmed': (data) => `[Zalo ZNS] Kính chào ${data.customerName}, lịch hẹn mã #${data.bookingId} của bạn vào lúc ${data.time} ngày ${data.date} đã được XÁC NHẬN. Hẹn gặp lại bạn tại salon!`,
  'booking_cancelled': (data) => `[Zalo ZNS] Kính chào ${data.customerName}, lịch hẹn mã #${data.bookingId} của bạn vào lúc ${data.time} ngày ${data.date} đã bị HỦY. Lý do: ${data.reason || 'Khách hàng yêu cầu'}.`
};

/**
 * Gửi thông báo Zalo qua Zalo Notification Service (ZNS)
 * @param {string} phone Số điện thoại nhận tin
 * @param {string} templateId ID của mẫu tin Zalo ZNS
 * @param {object} templateData Dữ liệu truyền vào template
 */
async function sendZaloNotification({ phone, templateId, templateData }) {
  const normalizedPhone = String(phone || '').trim();
  if (!normalizedPhone) {
    console.warn('[ZALO_SERVICE] Không thể gửi ZNS do thiếu số điện thoại.');
    return { success: false, error: 'Thiếu số điện thoại' };
  }

  const token = (process.env.ZALO_ACCESS_TOKEN || '').trim();
  const buildMockMessage = MOCK_TEMPLATE_MESSAGES[templateId] || ((data) => `[Zalo ZNS] Thông báo dịch vụ BeautyBook gửi tới khách hàng. Dữ liệu: ${JSON.stringify(data)}`);
  const messageBody = buildMockMessage(templateData);

  // Nếu không cấu hình Access Token, chạy chế độ giả lập (Simulation Mode)
  if (!token) {
    console.log(`\n========================================`);
    console.log(`[ZALO SIMULATION] CHẾ ĐỘ GIẢ LẬP GỬI ZALO ZNS`);
    console.log(`Đến SĐT: ${normalizedPhone}`);
    console.log(`Mẫu tin (Template): ${templateId}`);
    console.log(`Nội dung: ${messageBody}`);
    console.log(`========================================\n`);

    try {
      await new Promise((resolve, reject) => {
        db.query(
          `
            INSERT INTO zalo_notification_logs (phone, template_id, message_body, status, response_payload)
            VALUES (?, ?, ?, 'simulated', ?)
          `,
          [normalizedPhone, templateId, messageBody, JSON.stringify({ note: 'Simulated due to missing ZALO_ACCESS_TOKEN' })],
          (err, results) => {
            if (err) {
              console.error('[ZALO_SERVICE_DB_LOG_ERROR] Lỗi ghi log giả lập Zalo:', err.message);
              // Không throw lỗi để tránh crash luồng nghiệp vụ chính (đặt lịch)
              resolve(null);
            } else {
              resolve(results);
            }
          }
        );
      });
      return { success: true, mode: 'simulated', messageBody };
    } catch (dbErr) {
      return { success: true, mode: 'simulated_fallback_no_db', messageBody };
    }
  }

  // Chế độ chạy thật (Real OpenAPI integration)
  try {
    const response = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': token
      },
      body: JSON.stringify({
        phone: normalizedPhone.replace(/^0/, '84'), // Định dạng số điện thoại chuẩn quốc tế cho ZNS
        template_id: templateId,
        template_data: templateData,
        tracking_id: `booking_${Date.now()}`
      })
    });

    const result = await response.json();
    const isSuccess = Number(result.error) === 0;

    await new Promise((resolve) => {
      db.query(
        `
          INSERT INTO zalo_notification_logs (phone, template_id, message_body, status, response_payload)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          normalizedPhone,
          templateId,
          messageBody,
          isSuccess ? 'sent' : 'failed',
          JSON.stringify(result)
        ],
        (err) => {
          if (err) console.error('[ZALO_SERVICE_DB_LOG_ERROR] Lỗi ghi log:', err.message);
          resolve(null);
        }
      );
    });

    if (!isSuccess) {
      console.error('[ZALO_SERVICE_API_ERROR] Gửi ZNS thất bại:', result);
      return { success: false, error: result.message, raw: result };
    }

    return { success: true, mode: 'production', raw: result };
  } catch (error) {
    console.error('[ZALO_SERVICE_FETCH_ERROR] Lỗi khi kết nối Zalo OpenAPI:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendZaloNotification
};
