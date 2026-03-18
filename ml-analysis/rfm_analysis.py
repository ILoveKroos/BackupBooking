import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

class RFMAnalysis:
    """
    Phân tích RFM (Recency, Frequency, Monetary) cho khách hàng
    """
    
    def __init__(self, csv_file):
        """
        Khởi tạo với file CSV chứa dữ liệu booking
        Cột cần có: customer_id, booking_id, date, amount
        """
        self.df = pd.read_csv(csv_file)
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.reference_date = self.df['date'].max() + timedelta(days=1)
        
    def calculate_rfm(self):
        """
        Tính toán các chỉ số RFM
        """
        # Recency: Số ngày kể từ lần mua gần nhất
        recency = self.df.groupby('customer_id')['date'].max()
        recency = (self.reference_date - recency).dt.days
        
        # Frequency: Số lần mua
        frequency = self.df.groupby('customer_id').size()
        
        # Monetary: Tổng chi tiêu
        monetary = self.df.groupby('customer_id')['amount'].sum()
        
        # Tạo DataFrame RFM
        rfm = pd.DataFrame({
            'customer_id': recency.index,
            'recency': recency.values,
            'frequency': frequency.values,
            'monetary': monetary.values
        })
        
        return rfm
    
    def score_rfm(self, rfm, quartiles=4):
        """
        Gán điểm RFM dựa trên quartiles
        """
        # Recency: Thấp hơn tốt hơn (số ngày ít = gần đây)
        rfm['r_score'] = pd.qcut(rfm['recency'], q=quartiles, labels=False, duplicates='drop') + 1
        rfm['r_score'] = quartiles + 1 - rfm['r_score']  # Đảo ngược
        
        # Frequency: Cao hơn tốt hơn
        rfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), q=quartiles, labels=False, duplicates='drop') + 1
        
        # Monetary: Cao hơn tốt hơn
        rfm['m_score'] = pd.qcut(rfm['monetary'].rank(method='first'), q=quartiles, labels=False, duplicates='drop') + 1
        
        # Tổng điểm RFM
        rfm['rfm_score'] = rfm['r_score'].astype(str) + rfm['f_score'].astype(str) + rfm['m_score'].astype(str)
        
        return rfm
    
    def segment_customers(self, rfm):
        """
        Phân khúc khách hàng dựa trên RFM score
        """
        def get_segment(row):
            r, f, m = row['r_score'], row['f_score'], row['m_score']
            
            # Champions: Cao trên tất cả
            if r >= 4 and f >= 4 and m >= 4:
                return 'Champions'
            
            # Loyal Customers: Cao trên F và M
            elif f >= 4 and m >= 4:
                return 'Loyal Customers'
            
            # Potential Loyalists: Cao trên F hoặc M, R trung bình
            elif (f >= 3 or m >= 3) and r >= 2:
                return 'Potential Loyalists'
            
            # At Risk: Cao trên M nhưng R thấp
            elif m >= 3 and r <= 2:
                return 'At Risk'
            
            # Lost Customers: Thấp trên tất cả
            elif r <= 2 and f <= 2:
                return 'Lost Customers'
            
            # New Customers: F thấp
            elif f <= 2:
                return 'New Customers'
            
            else:
                return 'Need Attention'
        
        rfm['segment'] = rfm.apply(get_segment, axis=1)
        return rfm
    
    def analyze(self):
        """
        Thực hiện phân tích RFM hoàn chỉnh
        """
        print("=" * 60)
        print("PHÂN TÍCH RFM KHÁCH HÀNG")
        print("=" * 60)
        
        # Tính RFM
        rfm = self.calculate_rfm()
        print(f"\n✓ Tính toán RFM cho {len(rfm)} khách hàng")
        
        # Gán điểm
        rfm = self.score_rfm(rfm)
        print("✓ Gán điểm RFM")
        
        # Phân khúc
        rfm = self.segment_customers(rfm)
        print("✓ Phân khúc khách hàng")
        
        # Thống kê
        print("\n" + "=" * 60)
        print("THỐNG KÊ PHÂN KHÚC")
        print("=" * 60)
        segment_stats = rfm['segment'].value_counts()
        for segment, count in segment_stats.items():
            percentage = (count / len(rfm)) * 100
            print(f"{segment:.<30} {count:>5} ({percentage:>5.1f}%)")
        
        # Chi tiết từng phân khúc
        print("\n" + "=" * 60)
        print("CHI TIẾT TỪNG PHÂN KHÚC")
        print("=" * 60)
        
        for segment in rfm['segment'].unique():
            segment_data = rfm[rfm['segment'] == segment]
            print(f"\n{segment}:")
            print(f"  Số lượng: {len(segment_data)}")
            print(f"  Recency trung bình: {segment_data['recency'].mean():.1f} ngày")
            print(f"  Frequency trung bình: {segment_data['frequency'].mean():.1f} lần")
            print(f"  Monetary trung bình: {segment_data['monetary'].mean():.0f} VNĐ")
        
        return rfm
    
    def export_results(self, rfm, output_file='rfm_results.csv'):
        """
        Xuất kết quả ra file CSV
        """
        rfm.to_csv(output_file, index=False)
        print(f"\n✓ Kết quả đã được lưu vào {output_file}")
        
        # Xuất JSON cho dashboard
        json_output = output_file.replace('.csv', '.json')
        rfm_json = rfm.to_dict('records')
        with open(json_output, 'w', encoding='utf-8') as f:
            json.dump(rfm_json, f, ensure_ascii=False, indent=2)
        print(f"✓ Kết quả JSON đã được lưu vào {json_output}")
        
        return rfm

# Sử dụng
if __name__ == "__main__":
    try:
        # Tạo instance RFM
        rfm_analyzer = RFMAnalysis('booking.csv')
        
        # Thực hiện phân tích
        results = rfm_analyzer.analyze()
        
        # Xuất kết quả
        rfm_analyzer.export_results(results)
        
        print("\n" + "=" * 60)
        print("PHÂN TÍCH HOÀN THÀNH")
        print("=" * 60)
        
    except FileNotFoundError:
        print("Lỗi: Không tìm thấy file booking.csv")
    except Exception as e:
        print(f"Lỗi: {str(e)}")
