const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')

// Get courses // Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId })

    console.log(courses.length)
    console.log(req.params.bootcampId)

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    })
  } else {
    res.json(res.advancedResults)
  }
})

// Get single course // Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    'bootcamp',
    'name description'
  )

  if (!course) {
    return next(
      new ErrorResponse(
        `Course tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )
  }

  res.json({ success: true, data: course })
})

// Add course // Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User dengan id ${req.user.id} tidak bisa membuat course di bootcamp ini`,
        401
      )
    )

  const course = await Course.create(req.body)

  res.json({ success: true, data: course })
})

// Update course // Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id)

  if (!course) {
    return next(
      new ErrorResponse(
        `Course tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User dengan id ${req.user.id} tidak bisa mengupdate course ini`,
        401
      )
    )

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({ success: true, data: course })
})

// Delete course // Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return next(
      new ErrorResponse(
        `Course tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(
      new ErrorResponse(
        `User dengan id ${req.user.id} tidak bisa menghapus course ini`,
        401
      )
    )

  await course.remove()

  res.json({ success: true, data: {} })
})
