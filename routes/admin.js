const express = require('express')
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/admin')

const router = express.Router()

const User = require('../models/User')
const advancedResults = require('../middleware/advancedResults')
const authentication = require('../middleware/authentication')
const authorize = require('../middleware/authorize')

router.use(authentication)
router.use(authorize('admin'))

router.route('/').get(advancedResults(User), getUsers).post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
