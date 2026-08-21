import { AppError } from './errorHandler.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Gán lại dữ liệu đã validate chuẩn hóa vào req
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(new AppError('Validation Error', 400, formattedErrors));
      }
      next(err);
    }
  };
};
