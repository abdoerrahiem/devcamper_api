const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const sendTokenResponse = require('../utils/sendTokenResponse')

// Get all users // Private, Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.json(res.advancedResults)
})

// Get single user // Private, Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  res.json({
    success: true,
    data: user,
  })
})

// Create user // Private, Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user,
  })
})

// Update user // Private, Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({
    success: true,
    data: user,
  })
})

// Delete user // Private, Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    data: {},
  })
})
