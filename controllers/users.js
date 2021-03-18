const User = require('../models/User')
const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const sendTokenResponse = require('../utils/sendTokenResponse')
const sendEmail = require('../utils/sendEmail')

// Register user // Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const user = await User.create({ name, email, password, role })

  sendTokenResponse(user, 200, res)
})

// Login user // Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password)
    return next(new ErrorResponse('Semua field harus diisi', 400))

  const user = await User.findOne({ email }).select('+password')

  if (!user) return next(new ErrorResponse('User tidak ditemukan', 404))

  const isMatch = await user.matchPassword(password)

  if (!isMatch)
    return next(new ErrorResponse('Password yang anda masukkan salah', 401))

  sendTokenResponse(user, res)
})

// Get current logged in user // Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.json({ success: true, data: user })
})

// Update details // Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.json({ success: true, data: user })
})

// Update password // Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.matchPassword(req.body.currentPassword)))
    return next(new ErrorResponse('Password yang anda masukkan salah', 401))

  user.password = req.body.newPassword

  await user.save()

  sendTokenResponse(user, res)
})

// Forgot password // Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) return next(new ErrorResponse('User tidak ditemukan', 404))

  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/users/resetpassword/${resetToken}`

  const message = `Kamu menerima email ini karena atas permintaan reset password. Silahkan klik link dibawah ini! \n\n ${resetUrl}`

  const options = {
    email: user.email,
    subject: 'Reset password',
    message,
  }

  try {
    await sendEmail(options)

    res.json({ success: true, data: 'Email telah dikirim' })
  } catch (err) {
    console.log(err)

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorResponse('Email tidak terkirim', 500))
  }
})

// Reset password // Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) return next(new ErrorResponse('Invalid token', 400))

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendTokenResponse(user, res)
})

// Logout // Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.json({ success: true, data: {} })
})
