// Standardized error codes for consistent error handling
export const ERROR_CODES = {
  VALIDATION_ERROR: 'E001',
  NOT_FOUND: 'E002',
  DATABASE_FAILURE: 'E003',
  MISSING_FIELD: 'E004',
  DUPLICATE_ENTRY: 'E005',
  INTERNAL_ERROR: 'E500',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
