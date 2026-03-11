const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    orderId:    { type: String, required: true, unique: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items:      [{ type: mongoose.Schema.Types.Mixed }],
    totalValue: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)
