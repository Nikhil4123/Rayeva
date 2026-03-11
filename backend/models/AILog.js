const mongoose = require('mongoose')

const aiLogSchema = new mongoose.Schema(
  {
    module:          { type: String, required: true, index: true },
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestPayload:  { type: mongoose.Schema.Types.Mixed },
    responsePayload: { type: mongoose.Schema.Types.Mixed },
    promptTokens:    { type: Number, default: 0 },
    candidateTokens: { type: Number, default: 0 },
    totalTokens:     { type: Number, default: 0 },
    latencyMs:       { type: Number, default: 0 },
    success:         { type: Boolean, default: true, index: true },
    errorMessage:    { type: String },
  },
  { timestamps: true },
)

aiLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('AILog', aiLogSchema)
