const jwt = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')
const ErrorResponse = require('../utils/ErrorResponse')
const User = require('../models/User')

const authentication = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  if (!token)
    return next(new ErrorResponse('Anda tidak bisa mengakses halaman ini', 401))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded)

    req.user = await User.findById(decoded.id)

    next()
  } catch (err) {
    return next(new ErrorResponse('Anda tidak bisa mengakses halaman ini', 401))
  }
})

module.exports = authentication
