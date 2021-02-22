const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const geocoder = require('../utils/geocoder')

// Get all bootcamps // Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.json(res.advancedResults)
})

// Get bootcamp // Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp tidak ditemukan dengan id ${req.params.id}`,
        404
      )
    )

  res.json({ success: true, data: bootcamp })
})

// Create bootcamp // Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

  if (publishedBootcamp && req.user.role !== 'admin')
    return next(
      new ErrorResponse(`${req.user.role} hanya bisa mempublish satu bootcamp`),
      400
    )

  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({ success: true, data: bootcamp })
})

// Update bootcamp // Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id)

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
        `User dengan id ${req.params.id} tidak bisa mengupdate bootcamp ini`,
        401
      )
    )

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({ success: true, data: bootcamp })
})

// Delete bootcamp // Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

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
        `User dengan id ${req.params.id} tidak bisa menghapus bootcamp ini`,
        401
      )
    )

  bootcamp.remove()

  res.json({ success: true, data: {} })
})

// Get bootcamps within a radius
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  const location = await geocoder.geocode(zipcode)
  const { latitude, longitude } = location[0]

  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  })

  res.json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

// Upload photo to bootcamp // Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

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
        `User dengan id ${req.params.id} tidak bisa mengupdate bootcamp ini`,
        401
      )
    )

  if (!req.files) return next(new ErrorResponse('Masukkan photo', 400))

  const { file } = req.files

  if (!file.mimetype.startsWith('image'))
    return next(new ErrorResponse('Photo yang anda masukkan tidak valid', 400))

  if (file.size > process.env.MAX_FILE_UPLOAD)
    return next(new ErrorResponse('Size photo maksimal 1 MB', 400))

  file.name = `photo-${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err)
      return next(
        new ErrorResponse('Photo tidak bisa diupload. Coba lagi!', 500)
      )
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.json({
      success: true,
      data: file.name,
    })
  })
})
