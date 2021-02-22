const express = require('express')
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

const router = express.Router({ mergeParams: true })

const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')
const authentication = require('../middleware/authentication')
const authorize = require('../middleware/authorize')

router
  .route('/')
  .get(
    advancedResults(Course, { path: 'bootcamp', select: 'name description' }),
    getCourses
  )
  .post(authentication, authorize, addCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(authentication, authorize, updateCourse)
  .delete(authentication, authorize, deleteCourse)

module.exports = router
