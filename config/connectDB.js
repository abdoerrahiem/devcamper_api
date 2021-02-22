const mongoose = require('mongoose')

const connectDB = async () => {
  const connect = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

  console.log(
    `MongoDB Terhubung: ${connect.connection.host}`.toUpperCase().bgBlue
  )
}

module.exports = connectDB
