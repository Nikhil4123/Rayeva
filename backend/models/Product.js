const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    brand:       { type: String },
    price:       { type: Number },
    imageUrl:    { type: String },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Product', productSchema)
