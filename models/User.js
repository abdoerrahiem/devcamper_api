const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Nama harus diisi'] },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Email tidak valid',
    ],
  },
  role: { type: String, enum: ['user', 'publisher'], default: 'user' },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', UserSchema)
