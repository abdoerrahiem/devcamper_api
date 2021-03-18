require('dotenv').config()
const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const passport = require('passport')
const connectDB = require('./config/connectDB')
const { notFoundRoute, errorHandler } = require('./middleware/error')
require('colors')

const app = express()

// Passport config
require('./config/passport')(passport)

// Connect database
connectDB()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())

app.use(cookieParser())

app.use(fileupload())

app.use(mongoSanitize())

app.use(helmet())

app.use(xss())

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
})

app.use(limiter)

app.use(hpp())

app.use(cors())

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Setting folder statis
app.use(express.static(path.join(__dirname, 'public')))

// Routes
fs.readdirSync('./routes').map((route) => {
  route = route.split('.')[0]

  return app.use(`/api/v1/${route}`, require(`./routes/${route}`))
})

// app.use('/bootcamps', require('./routes/bootcamps'))
// app.use('/courses', require('./routes/courses'))
// app.use('/users', require('./routes/users'))
// app.use('/admin', require('./routes/admin'))
// app.use('/reviews', require('./routes/reviews'))

app.use(notFoundRoute)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(
  PORT,
  console.log(
    `Server berjalan di mode ${process.env.NODE_ENV} pada port ${PORT}.`.toUpperCase()
      .bgBlue
  )
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(
    `Tidak dapat terhubung! Pesan error: ${err.message}.`.toUpperCase().bgRed
  )
  server.close(() => process.exit(1))
})
