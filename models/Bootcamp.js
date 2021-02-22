const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama harus diisi'],
      unique: true,
      trim: true,
      maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Deskripsi harus diisi'],
      maxlength: [500, 'Deskripsi tidak boleh lebih dari 500 karakter'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Alamat web tidak valid',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Nomor telepon tidak boleh lebih dari 20 karakter'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email tidak valid',
      ],
    },
    address: { type: String, required: [true, 'Alamat harus diisi'] },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      streetName: String,
      city: String,
      stateCode: String,
      zipcode: String,
      countryCode: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating minimal 1'],
      max: [10, 'Rating maksimal 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })

  next()
})

BootcampSchema.pre('save', async function (next) {
  const location = await geocoder.geocode(this.address)
  const {
    longitude,
    latitude,
    formattedAddress,
    streetName,
    city,
    stateCode,
    zipcode,
    countryCode,
  } = location[0]

  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
    formattedAddress,
    streetName,
    city,
    stateCode,
    zipcode,
    countryCode,
  }

  this.address = undefined

  next()
})

BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
})

BootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id })
  console.log(`Courses telah dihapus dari dari bootcamp dengan id ${this._id}`)

  next()
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)
