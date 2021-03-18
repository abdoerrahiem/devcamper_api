const ErrorResponse = require('../utils/errorResponse')

exports.notFoundRoute = (req, res, next) => {
  const error = new Error(`Route tidak ditemukan - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message

  if (err.name === 'CastError') {
    const message = `Resource tidak ditemukan`
    error = new ErrorResponse(message, 404)
  }

  if (err.code === 11000) {
    const message = `${Object.keys(err.keyPattern)} telah digunakan`
    error = new ErrorResponse(message, 400)
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message)
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  })
}
