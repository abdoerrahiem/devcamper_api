const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const sendEmail = require('../utils/sendEmail')
const sendTokenResponse = require('../utils/sendTokenResponse')
const User = require('../models/User')

// Register user
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const user = await User.create({
    name,
    email,
    password,
    role,
  })

  const confirmEmailToken = user.generateEmailConfirmToken()

  const confirmEmailUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/confirm-email?token=${confirmEmailToken}`

  user.save({ validateBeforeSave: false })

  await sendEmail({
    email: user.email,
    subject: 'Konfirmasi Pendaftaran',
    confirmEmailUrl,
  })

  sendTokenResponse(user, 200, res)
})
