const serviceModel = require('../models/serviceModel');

exports.getAllServices = (req, res) => {
  serviceModel.getAllServices((err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: services });
  });
};

exports.getAllServicesForAdmin = (req, res) => {
  serviceModel.getAllServices(
    (err, services) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi server', error: err });
      }
      return res.status(200).json({ success: true, data: services });
    },
    true
  );
};

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

exports.createService = (req, res) => {
  const { name, description, price, duration, category, image_url } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  const serviceData = {
    name,
    description: description || '',
    price,
    duration,
    category: category || '',
    image_url: image_url || '',
    status: 'active'
  };

  serviceModel.createService(serviceData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      serviceId: result.insertId
    });
  });
};

exports.updateService = (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration, category, image_url, status } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  const serviceData = {
    name,
    description: description || '',
    price,
    duration,
    category: category || '',
    image_url: image_url || '',
    status: status || 'active'
  };

  serviceModel.updateService(id, serviceData, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, message: 'Cập nhật dịch vụ thành công' });
  });
};

exports.updateServicePrice = (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: 'Giá dịch vụ không hợp lệ' });
  }

  serviceModel.updateServicePrice(id, parsedPrice, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật giá dịch vụ thành công' });
  });
};

exports.deleteService = (req, res) => {
  const { id } = req.params;

  serviceModel.deleteService(id, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, message: 'Xóa dịch vụ thành công' });
  });
};
