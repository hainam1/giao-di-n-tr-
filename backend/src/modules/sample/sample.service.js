// Mock in-memory data store phục vụ chạy thử nghiệm ngay cả khi chưa kết nối DB
let SAMPLES = [
  { id: '1', title: 'Sản phẩm mẫu A', description: 'Mô tả chi tiết sản phẩm mẫu A', price: 150000, status: 'active', createdAt: new Date().toISOString() },
  { id: '2', title: 'Sản phẩm mẫu B', description: 'Mô tả chi tiết sản phẩm mẫu B', price: 250000, status: 'active', createdAt: new Date().toISOString() },
  { id: '3', title: 'Sản phẩm mẫu C', description: 'Mô tả chi tiết sản phẩm mẫu C', price: 350000, status: 'inactive', createdAt: new Date().toISOString() },
];

export const getAllSamplesService = async (query) => {
  let result = [...SAMPLES];
  if (query.status) {
    result = result.filter((item) => item.status === query.status);
  }
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    result = result.filter((item) => item.title.toLowerCase().includes(searchLower));
  }
  return result;
};

export const getSampleByIdService = async (id) => {
  return SAMPLES.find((item) => item.id === id) || null;
};

export const createSampleService = async (data) => {
  const newItem = {
    id: String(Date.now()),
    title: data.title,
    description: data.description || '',
    price: data.price || 0,
    status: data.status || 'active',
    createdAt: new Date().toISOString(),
  };
  SAMPLES.push(newItem);
  return newItem;
};

export const updateSampleService = async (id, data) => {
  const index = SAMPLES.findIndex((item) => item.id === id);
  if (index === -1) return null;

  SAMPLES[index] = {
    ...SAMPLES[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return SAMPLES[index];
};

export const deleteSampleService = async (id) => {
  const index = SAMPLES.findIndex((item) => item.id === id);
  if (index === -1) return false;
  SAMPLES.splice(index, 1);
  return true;
};
