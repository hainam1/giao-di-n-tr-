import { describe, it, expect, vi } from 'vitest';
import { successResponse, errorResponse } from '../../src/core/responseHandler.js';

describe('Response Handler Core Module', () => {
  it('should return standardized success response format', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res = { status: mockStatus };

    successResponse(res, { statusCode: 200, message: 'OK', data: { id: 1 } });

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'OK',
      data: { id: 1 },
    });
  });

  it('should return standardized error response format', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res = { status: mockStatus };

    errorResponse(res, { statusCode: 400, message: 'Bad Request', error: 'Invalid input' });

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'Bad Request',
      error: 'Invalid input',
    });
  });
});
