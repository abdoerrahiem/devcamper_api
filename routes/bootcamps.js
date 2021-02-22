const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps')

const router = express.Router()

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')
const authentication = require('../middleware/authentication')
const authorize = require('../middleware/authorize')

// Include other resource routers
router.use('/:bootcampId/courses', require('./courses'))
router.use('/:bootcampId/reviews', require('./reviews'))

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(authentication, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(authentication, authorize('publisher', 'admin'), updateBootcamp)
  .delete(authentication, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(authentication, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router
