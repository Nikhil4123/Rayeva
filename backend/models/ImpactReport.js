const mongoose = require('mongoose')

const impactReportSchema = new mongoose.Schema(
  {
    orderId:       { type: String, required: true, unique: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    analysisDepth: { type: String, default: 'standard' },
    aiResult:      { type: mongoose.Schema.Types.Mixed },
    overallScore:  { type: Number },
    grade:         { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ImpactReport', impactReportSchema)
