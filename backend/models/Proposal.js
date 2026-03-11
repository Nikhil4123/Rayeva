const mongoose = require('mongoose')

const proposalSchema = new mongoose.Schema(
  {
    userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyName:         { type: String, required: true },
    companyType:         { type: String },
    monthlyRevenue:      { type: Number },
    targetBudget:        { type: Number },
    focusCategories:     [{ type: String }],
    sustainabilityGoals: [{ type: String }],
    notes:               { type: String },
    aiResult:            { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

proposalSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Proposal', proposalSchema)
