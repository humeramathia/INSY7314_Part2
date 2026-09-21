function success(res, status, message, data) {
  const body = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(status).json(body);
}

function fail(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = {
  success,
  fail,
};
