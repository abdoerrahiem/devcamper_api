const router = require('express').Router()
const passport = require('passport')
const { register } = require('../controllers/auth')

router.post('/register', register)

router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.json({ success: true, message: 'Kamu berhasil login' })
  }
)

module.exports = router
