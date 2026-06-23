const DISABLED_MESSAGE = 'Ket noi toi API dich vu da bi tat.';

const createResponse = (data) => Promise.resolve({
  data: {
    success: true,
    data
  }
});

const createDisabledError = () => {
  const error = new Error(DISABLED_MESSAGE);
  error.response = {
    status: 410,
    data: {
      success: false,
      message: DISABLED_MESSAGE
    }
  };
  return Promise.reject(error);
};

const serviceService = {
  getAllServices: () => createResponse([]),

  getTrendingServices: () => createResponse({
    all_services: [],
    categories: []
  }),

  getAdminServices: () => createResponse([]),

  getServiceById: () => createResponse(null),

  getRecommendations: () => createResponse({
    recommendations: []
  }),

  createService: () => createDisabledError(),

  updateService: () => createDisabledError(),

  updateServicePrice: () => createDisabledError(),

  deleteService: () => createDisabledError(),

  createCategory: () => createDisabledError(),

  getAllCategories: () => createResponse([])
};

export default serviceService;
