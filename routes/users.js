const express = require('express')
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers/users')

const router = express.Router()

const authentication = require('../middleware/authentication')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authentication, getMe)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.put('/updatedetails', authentication, updateDetails)
router.put('/updatepassword', authentication, updatePassword)
router.get('/logout', authentication, logout)

module.exports = router
