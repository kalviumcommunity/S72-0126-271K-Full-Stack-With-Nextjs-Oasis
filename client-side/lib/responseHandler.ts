import { NextResponse } from 'next/server';
import { ERROR_CODES, ErrorCode } from './errorCodes';

/**
 * Unified success response handler
 * @param data - The data to return
 * @param message - Success message
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = (
  data: any,
  message = 'Success',
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Unified error response handler
 * @param message - Error message
 * @param code - Error code from ERROR_CODES
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details
 */
export const sendError = (
  message = 'Something went wrong',
  code: ErrorCode = 'INTERNAL_ERROR',
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: ERROR_CODES[code],
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Handle Zod validation errors with formatted response
 * @param error - ZodError object
 */
export const sendValidationError = (error: any) => {
  const formattedErrors = error.errors.map((e: any) => ({
    field: e.path.join('.'),
    message: e.message,
  }));

  return NextResponse.json(
    {
      success: false,
      message: 'Validation Error',
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details: formattedErrors,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
};
