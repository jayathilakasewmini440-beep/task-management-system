const IS_PROD = process.env.NODE_ENV === 'production';

// BE-10: 5xx responses must not leak internals. `description` historically
// carried err.message — log it server-side and suppress it in production.
// 4xx descriptions are intentional hints (e.g. "ID must be a number") and are
// always preserved.
const errorResponse = (res, statusCode, errorCode, message, description = null) => {
  if (statusCode >= 500 && description) {
    console.error(`[${errorCode}] ${message}: ${description}`);
  }
  return res.status(statusCode).json({
    errorCode,
    message,
    description: statusCode >= 500 && IS_PROD ? null : description,
  });
};

// BE-10: standard 500 helper — logs the real error, returns a generic body.
const internalError = (res, err, message = 'Internal server error', errorCode = 'INTERNAL_ERROR') => {
  console.error(`[${errorCode}] ${message}:`, err);
  return res.status(500).json({
    errorCode,
    message,
    description: IS_PROD ? null : (err && err.message) || null,
  });
};

// Validation-error contract: an `errors: [{ field, message }]` array (lowercase
// keys) alongside the existing { errorCode, message, description }. The
// top-level message is kept for non-field/global validation messages.
const validationError = (res, fieldErrors, message = null) => {
  const list = (Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors])
    .filter(Boolean)
    .map((e) => ({ field: e.field, message: e.message }));
  return res.status(400).json({
    errorCode: 'VALIDATION_ERROR',
    message: message || (list[0] && list[0].message) || 'Validation failed',
    description: null,
    errors: list,
  });
};

module.exports = {
  errorResponse,
  internalError,
  validationError,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};
