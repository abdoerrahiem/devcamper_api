const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
var xss = require('xss-clean')
var rateLimit = require('express-rate-limit')
var hpp = require('hpp')
var cors = require('cors')
const connectDB = require('./config/connectDB')
const errorHandler = require('./middleware/errorHandler')
require('colors')

dotenv.config({ path: './config/config.env' })

const app = express()

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

app.use(express.static(path.join(__dirname, 'public')))

app.use('/bootcamps', require('./routes/bootcamps'))
app.use('/courses', require('./routes/courses'))
app.use('/users', require('./routes/users'))
app.use('/admin', require('./routes/admin'))
app.use('/reviews', require('./routes/reviews'))

app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(
  PORT,
  console.log(
    `Server berjalan di mode ${process.env.NODE_ENV} pada port ${PORT}.`.toUpperCase()
      .bgBlue
  )
)

process.on('unhandledRejection', (err, promise) => {
  console.log(
    `Tidak dapat terhubung! Pesan error: ${err.message}.`.toUpperCase().bgRed
  )
  server.close(() => process.exit(1))
})
