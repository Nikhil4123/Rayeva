const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    sessionId:   { type: String, required: true, index: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userMessage: { type: String },
    aiResponse:  { type: String },
    intent:      { type: String },
    confidence:  { type: Number },
    escalate:    { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Conversation', conversationSchema)
