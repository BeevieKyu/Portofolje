
/**
 * Global error handling middleware
 * recives errors from next(error)
 * In express any controller od middleware can call next(error)
 * checks if the error is a mongoose casrError.
 * Chooses what HTTP status to return, err.status if it exists, then err.statusCode.
 * Otherwise it returns 400 for CastError and 500 for anything else.
 */
const errorHandler = (err, req, res, next) => {
  const isCastError = err?.name === 'CastError';
  const statusCode = err.status || err.statusCode || (isCastError ? 400 : 500);
  const message = isCastError
    ? `Invalid value for ${err.path}`
    : (err.message || 'Internal server error :(');

  console.error('Error middleware captured:', err);

  res.status(statusCode).json({
    error: message,
    status: statusCode,
  });
};

export default errorHandler;
