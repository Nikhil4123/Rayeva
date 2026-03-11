const mongoose = require('mongoose')

const aiTagSchema = new mongoose.Schema(
  {
    productId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    primaryCategory:     { type: String },
    subCategory:         { type: String },
    confidenceScore:     { type: Number },
    sustainabilityTags:  [{ type: String }],
    keywords:            [{ type: String }],
    suggestedAttributes: { type: mongoose.Schema.Types.Mixed },
    reasoning:           { type: String },
  },
  { timestamps: true },
)

aiTagSchema.index({ productId: 1 })

module.exports = mongoose.model('AITag', aiTagSchema)
