const express = require('express')
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews')

const router = express.Router({ mergeParams: true })

const Review = require('../models/Review')
const advancedResults = require('../middleware/advancedResults')
const authentication = require('../middleware/authentication')
const authorize = require('../middleware/authorize')

router
  .route('/')
  .get(
    advancedResults(Review, { path: 'bootcamp', select: 'name description' }),
    getReviews
  )
  .post(authentication, authorize('user', 'admin'), addReview)

router
  .route('/:id')
  .get(getReview)
  .put(authentication, authorize('user', 'admin'), updateReview)
  .delete(authentication, authorize('user', 'admin'), deleteReview)

module.exports = router
