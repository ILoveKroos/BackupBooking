// Mock database query calls BEFORE requiring any modules
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  ready: Promise.resolve()
}));

const rfmService = require('../src/services/rfmService');

describe('RFM Service - Phân Khúc Khách Hàng Tự Động', () => {
  describe('Quy tắc phân khúc (segmentCustomer)', () => {
    test('Khách có điểm R=4, F=4, M=4 là Champions', () => {
      const segment = rfmService.segmentCustomer(4, 4, 4);
      expect(segment).toBe('Champions');
    });

    test('Khách mua nhiều và chi nhiều F>=4, M>=4 nhưng lâu chưa quay lại là Loyal Customers', () => {
      const segment = rfmService.segmentCustomer(2, 4, 4);
      expect(segment).toBe('Loyal Customers');
    });

    test('Khách mua rất ít F<=2 và lâu chưa quay lại R<=2 là Lost Customers', () => {
      const segment = rfmService.segmentCustomer(1, 1, 1);
      expect(segment).toBe('Lost Customers');
    });

    test('Khách mới F<=2 nhưng vừa quay lại gần đây là New Customers', () => {
      const segment = rfmService.segmentCustomer(4, 1, 1);
      expect(segment).toBe('New Customers');
    });
  });

  describe('Tính điểm phân bổ theo Quartile (scoreRFM)', () => {
    test('Chia nhóm khách hàng thành các thang điểm từ 1 đến 4 dựa trên phân vị', () => {
      const mockCustomers = [
        { customer_id: 1, recency: 10, frequency: 1, monetary: 100000 },
        { customer_id: 2, recency: 20, frequency: 2, monetary: 200000 },
        { customer_id: 3, recency: 30, frequency: 3, monetary: 300000 },
        { customer_id: 4, recency: 40, frequency: 4, monetary: 400000 }
      ];

      const scored = rfmService.scoreRFM(mockCustomers);

      expect(scored.length).toBe(4);
      
      const customer4 = scored.find(c => c.customer_id === 4);
      expect(customer4.m_score).toBe(4);

      const customer1 = scored.find(c => c.customer_id === 1);
      expect(customer1.m_score).toBe(1);

      expect(customer1.r_score).toBe(4);
      expect(customer4.r_score).toBe(1);
    });
  });
});
