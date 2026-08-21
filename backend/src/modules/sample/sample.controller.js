import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';
import {
  getAllSamplesService,
  getSampleByIdService,
  createSampleService,
  updateSampleService,
  deleteSampleService,
} from './sample.service.js';

export const getSamples = async (req, res, next) => {
  try {
    const samples = await getAllSamplesService(req.query);
    return successResponse(res, {
      message: 'Lấy danh sách sản phẩm mẫu thành công',
      data: samples,
      meta: { total: samples.length },
    });
  } catch (err) {
    next(err);
  }
};

export const getSampleById = async (req, res, next) => {
  try {
    const sample = await getSampleByIdService(req.params.id);
    if (!sample) {
      throw new AppError('Không tìm thấy mục mẫu', 404);
    }
    return successResponse(res, {
      message: 'Lấy chi tiết sản phẩm mẫu thành công',
      data: sample,
    });
  } catch (err) {
    next(err);
  }
};

export const createSample = async (req, res, next) => {
  try {
    const newSample = await createSampleService(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Tạo sản phẩm mẫu mới thành công',
      data: newSample,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSample = async (req, res, next) => {
  try {
    const updated = await updateSampleService(req.params.id, req.body);
    if (!updated) {
      throw new AppError('Không tìm thấy mục mẫu để cập nhật', 404);
    }
    return successResponse(res, {
      message: 'Cập nhật mục mẫu thành công',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSample = async (req, res, next) => {
  try {
    const deleted = await deleteSampleService(req.params.id);
    if (!deleted) {
      throw new AppError('Không tìm thấy mục mẫu để xóa', 404);
    }
    return successResponse(res, {
      message: 'Xóa mục mẫu thành công',
    });
  } catch (err) {
    next(err);
  }
};
