const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const Review = require('../models/Review')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')

// Get reviews // Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId })

    return res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    })
  } else {
    res.json(res.advancedResults)
  }
})

// Get single review // Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate(
    'bootcamp',
    'name description'
  )

  if (!review)
    return next(
      new ErrorResponse(
        `Review tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )

  res.json({
    success: true,
    data: review,
  })
})

// Add review // Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp tidak ditemukan dengan id ${req.params.bootcampId}`,
        404
      )
    )

  const review = await Review.create(req.body)

  res.status(201).json({
    success: true,
    data: review,
  })
})

// Update review // Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id)

  if (!review)
    return next(
      new ErrorResponse(
        `Review tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(new ErrorResponse(`Anda tidak bisa mengupdate review ini`, 401))

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({
    success: true,
    data: review,
  })
})

// Delete review // Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review)
    return next(
      new ErrorResponse(
        `Review tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(new ErrorResponse(`Anda tidak bisa mengupdate review ini`, 401))

  await review.remove()

  res.json({
    success: true,
    data: {},
  })
})
