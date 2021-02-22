const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Title harus diisi'],
    maxlength: 100,
  },
  text: { type: String, required: [true, 'Text review harus diisi'] },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Rating harus diisi antara 1 - 10'],
  },
  createdAt: { type: Date, default: Date.now },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

// Prevent user to submit more than 1 review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

// Static method to get average of review rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const arr = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } },
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: arr[0].averageRating,
    })
  } catch (err) {
    console.log(err)
  }
}

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverageRating before save
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)
