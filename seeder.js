const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
require('colors')

dotenv.config({ path: './config/config.env' })

const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

// Read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
)

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    await Course.create(courses)
    await User.create(users)
    await Review.create(reviews)

    console.log('Data berhasil tersimpan ke database'.bgGreen)
    process.exit(1)
  } catch (err) {
    console.log(`Import data gagal. Pesan error: ${err}`.bgRed)
    process.exit(1)
  }
}

// Delete data from DB
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    await Course.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()

    console.log('Data berhasil dihapus dari database'.bgGreen)
    process.exit(1)
  } catch (err) {
    console.log(`Data gagal terhapus. Pesan error: ${err}`.bgRed)
    process.exit(1)
  }
}

if (process.argv[2] === '-insert') {
  importData()
} else if (process.argv[2] === '-delete') {
  deleteData()
}
