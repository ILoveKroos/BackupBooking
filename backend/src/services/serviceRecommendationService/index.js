const db = require('../../config/db');

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const hasAppointmentServicesTable = async () => {
  const rows = await query(
    `SELECT COUNT(*) AS c
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'appointment_services'`
  );

  return Number(rows[0]?.c || 0) > 0;
};

const getServiceById = async (serviceId) => {
  const rows = await query(
    `SELECT id, name, category, price, duration, image_url
     FROM services
     WHERE id = ? AND status = 'active'
     LIMIT 1`,
    [serviceId]
  );

  return rows[0] || null;
};

const getTotalCustomerCount = async () => {
  const rows = await query(
    `SELECT COUNT(DISTINCT user_id) AS total
     FROM appointments
     WHERE status != 'cancelled'`
  );

  return Number(rows[0]?.total || 0);
};

const getSourceCustomerCount = async (serviceId, useServiceLines) => {
  const sql = useServiceLines
    ? `SELECT COUNT(DISTINCT a.user_id) AS total
       FROM appointments a
       JOIN appointment_services aps ON aps.appointment_id = a.id
       WHERE aps.service_id = ?
         AND a.status != 'cancelled'`
    : `SELECT COUNT(DISTINCT user_id) AS total
       FROM appointments
       WHERE service_id = ?
         AND status != 'cancelled'`;

  const rows = await query(sql, [serviceId]);
  return Number(rows[0]?.total || 0);
};

const getRuleCandidates = async (serviceId, useServiceLines, limit) => {
  if (useServiceLines) {
    return query(
      `SELECT
         target.id,
         target.name,
         target.category,
         target.price,
         target.duration,
         target.image_url,
         COUNT(DISTINCT target_appt.user_id) AS overlap_customers,
         COUNT(DISTINCT target_appt.id) AS related_booking_count,
         (
           SELECT COUNT(DISTINCT target_all.user_id)
           FROM appointments target_all
           JOIN appointment_services target_all_line
             ON target_all_line.appointment_id = target_all.id
           WHERE target_all_line.service_id = target.id
             AND target_all.status != 'cancelled'
         ) AS target_customers
       FROM appointments source_appt
       JOIN appointment_services source_line
         ON source_line.appointment_id = source_appt.id
       JOIN appointments target_appt
         ON target_appt.user_id = source_appt.user_id
       JOIN appointment_services target_line
         ON target_line.appointment_id = target_appt.id
        AND target_line.service_id <> ?
       JOIN services target
         ON target.id = target_line.service_id
        AND target.status = 'active'
       WHERE source_line.service_id = ?
         AND source_appt.status != 'cancelled'
         AND target_appt.status != 'cancelled'
       GROUP BY target.id, target.name, target.category, target.price, target.duration, target.image_url
       ORDER BY overlap_customers DESC, related_booking_count DESC, target.name ASC
       LIMIT ?`,
      [serviceId, serviceId, limit]
    );
  }

  return query(
    `SELECT
       target.id,
       target.name,
       target.category,
       target.price,
       target.duration,
       target.image_url,
       COUNT(DISTINCT target_appt.user_id) AS overlap_customers,
       COUNT(DISTINCT target_appt.id) AS related_booking_count,
       (
         SELECT COUNT(DISTINCT target_all.user_id)
         FROM appointments target_all
         WHERE target_all.service_id = target.id
           AND target_all.status != 'cancelled'
       ) AS target_customers
     FROM appointments source_appt
     JOIN appointments target_appt
       ON target_appt.user_id = source_appt.user_id
      AND target_appt.service_id <> ?
     JOIN services target
       ON target.id = target_appt.service_id
      AND target.status = 'active'
     WHERE source_appt.service_id = ?
       AND source_appt.status != 'cancelled'
       AND target_appt.status != 'cancelled'
     GROUP BY target.id, target.name, target.category, target.price, target.duration, target.image_url
     ORDER BY overlap_customers DESC, related_booking_count DESC, target.name ASC
     LIMIT ?`,
    [serviceId, serviceId, limit]
  );
};

const getFallbackCandidates = async (service, excludedIds, limit) => {
  const excluded = Array.from(new Set([service.id, ...excludedIds])).filter(Boolean);
  const placeholders = excluded.map(() => '?').join(', ');
  const params = [...excluded, service.category || '', limit];

  return query(
    `SELECT
       s.id,
       s.name,
       s.category,
       s.price,
       s.duration,
       s.image_url,
       COUNT(a.id) AS related_booking_count,
       0 AS overlap_customers,
       COUNT(DISTINCT a.user_id) AS target_customers
     FROM services s
     LEFT JOIN appointments a
       ON a.service_id = s.id
      AND a.status != 'cancelled'
     WHERE s.status = 'active'
       AND s.id NOT IN (${placeholders})
     GROUP BY s.id, s.name, s.category, s.price, s.duration, s.image_url
     ORDER BY CASE WHEN s.category = ? THEN 0 ELSE 1 END, related_booking_count DESC, s.name ASC
     LIMIT ?`,
    params
  );
};

const buildRuleMetrics = (row, sourceCustomerCount, totalCustomerCount, sourceServiceName) => {
  const overlapCustomers = Number(row.overlap_customers || 0);
  const targetCustomers = Number(row.target_customers || 0);
  const confidence = sourceCustomerCount > 0 ? overlapCustomers / sourceCustomerCount : 0;
  const support = totalCustomerCount > 0 ? overlapCustomers / totalCustomerCount : 0;
  const targetProbability = totalCustomerCount > 0 ? targetCustomers / totalCustomerCount : 0;
  const lift = targetProbability > 0 ? confidence / targetProbability : 0;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price || 0),
    duration: Number(row.duration || 0),
    image_url: row.image_url || '',
    related_booking_count: Number(row.related_booking_count || 0),
    rule: {
      antecedent: sourceServiceName,
      consequent: row.name,
      confidence: Number((confidence * 100).toFixed(1)),
      support: Number((support * 100).toFixed(1)),
      lift: Number(lift.toFixed(2)),
      overlap_customers: overlapCustomers
    },
    reason:
      overlapCustomers > 0
        ? `Khách từng đặt ${sourceServiceName} cũng hay đặt ${row.name}.`
        : `Dịch vụ cùng nhóm hoặc đang được đặt nhiều, phù hợp để gợi ý kèm ${sourceServiceName}.`
  };
};

const toPublicRecommendation = ({ id, name, category, price, duration, image_url, reason }) => ({
  id,
  name,
  category,
  price,
  duration,
  image_url,
  reason
});

const getRecommendationsForService = async ({ serviceId, limit = 4 }) => {
  const parsedServiceId = Number(serviceId);
  const parsedLimit = Math.min(Math.max(Number(limit) || 4, 1), 8);

  if (!Number.isInteger(parsedServiceId) || parsedServiceId <= 0) {
    const error = new Error('serviceId không hợp lệ');
    error.status = 400;
    throw error;
  }

  const service = await getServiceById(parsedServiceId);
  if (!service) {
    const error = new Error('Dịch vụ không tồn tại hoặc đang tạm ẩn');
    error.status = 404;
    throw error;
  }

  const [useServiceLines, totalCustomerCount] = await Promise.all([
    hasAppointmentServicesTable(),
    getTotalCustomerCount()
  ]);
  const sourceCustomerCount = await getSourceCustomerCount(parsedServiceId, useServiceLines);
  const ruleRows = await getRuleCandidates(parsedServiceId, useServiceLines, parsedLimit);

  let recommendations = ruleRows.map((row) =>
    buildRuleMetrics(row, sourceCustomerCount, totalCustomerCount, service.name)
  );

  if (recommendations.length < parsedLimit) {
    const fallbackRows = await getFallbackCandidates(
      service,
      recommendations.map((item) => item.id),
      parsedLimit - recommendations.length
    );
    recommendations = [
      ...recommendations,
      ...fallbackRows.map((row) =>
        buildRuleMetrics(row, sourceCustomerCount, totalCustomerCount, service.name)
      )
    ];
  }

  return {
    source_service: service,
    recommendations: recommendations.map(toPublicRecommendation)
  };
};

module.exports = {
  getRecommendationsForService
};
