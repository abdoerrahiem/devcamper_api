const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: [true, 'Title harus diisi'] },
  description: { type: String, required: [true, 'Deskripsi harus diisi'] },
  weeks: { type: String, required: [true, 'Jumlah minggu harus diisi'] },
  tuition: { type: Number, required: [true, 'Harga harus diisi'] },
  minimumSkill: {
    type: String,
    required: [true, 'Skill harus diisi'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: { type: Boolean, default: false },
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

// Static method to get average of course tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const arr = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } },
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(arr[0].averageCost / 10) * 10,
    })
  } catch (err) {
    console.log(err)
  }
}

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before save
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course', CourseSchema)
