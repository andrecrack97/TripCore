module.exports = (err, req, res, _next) => {
    const status = err.status || 500;
    const payload = err.payload || { message: err.message || "Internal Server Error" };
    res.status(status).json(payload);
  };
  