const ErrorResponse = require('../utils/ErrorResponse')

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role ${req.user.role} tidak bisa mengakses halaman ini`,
          403
        )
      )
    }
    next()
  }
}

module.exports = authorize
