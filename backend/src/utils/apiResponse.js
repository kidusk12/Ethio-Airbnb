export function success(res, { status = 200, message, data = {} }) {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}