const mongoose = require('mongoose')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    name: {
      type: String,
      required: [true, 'Nama harus diisi'],
    },
    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email tidak valid',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      minlength: 6,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: String,
    twoFactorCodeExpire: Date,
    twoFactorEnable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Encrypt password menggunakan bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Membuat username
userSchema.pre('save', function () {
  this.username = this.email.split('@')[0]
})

// Sign token menggunakan jsonwebtoken
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Mencocokkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate dan hash password
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

// Generate token email konfirmasi
userSchema.methods.generateEmailConfirmToken = function () {
  const confirmationToken = crypto.randomBytes(20).toString('hex')

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmationToken)
    .digest('hex')

  const confirmTokenExtend = crypto.randomBytes(100).toString('hex')

  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`

  return confirmTokenCombined
}

module.exports = mongoose.model('User', userSchema)
