const serviceModel = require('../models/serviceModel');

// Lấy tất cả dịch vụ
exports.getAllServices = (req, res) => {
  serviceModel.getAllServices((err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: services });
  });
};

// Lấy dịch vụ theo ID
exports.getServiceById = (req, res) => {
  const { id } = req.params;
  
  serviceModel.getServiceById(id, (err, service) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    res.status(200).json({ success: true, data: service });
  });
};

// Tạo dịch vụ mới (admin)
exports.createService = (req, res) => {
  const { name, description, price, duration } = req.body;
  
  if (!name || !price || !duration) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }
  
  const serviceData = {
    name,
    description: description || '',
    price,
    duration,
    status: 'active'
  };
  
  serviceModel.createService(serviceData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công', serviceId: result.insertId });
  });
};

// Cập nhật dịch vụ (admin)
exports.updateService = (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration, status } = req.body;
  
  if (!name || !price || !duration) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }
  
  const serviceData = {
    name,
    description: description || '',
    price,
    duration,
    status: status || 'active'
  };
  
  serviceModel.updateService(id, serviceData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, message: 'Cập nhật dịch vụ thành công' });
  });
};

// Xóa dịch vụ (admin)
exports.deleteService = (req, res) => {
  const { id } = req.params;
  
  serviceModel.deleteService(id, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, message: 'Xóa dịch vụ thành công' });
  });
};
