/**
 * db/seed.js — MongoDB seed script
 * Runs once to create indexes and insert demo data.
 * Usage: npm run seed
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const { connect }  = require('../config/db')
const User         = require('../models/User')
const Order        = require('../models/Order')
const bcrypt       = require('bcryptjs')
const logger       = require('../utils/logger')

const run = async () => {
  await connect()
  logger.info('Seed: starting…')

  // ── Ensure indexes ─────────────────────────────────────────────────────────
  await Promise.all([
    User.createIndexes(),
    Order.createIndexes(),
  ])
  logger.info('Seed: indexes ensured')

  // ── Default admin user ─────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@rayeva.ai'
  const adminPass  = process.env.SEED_ADMIN_PASS  || 'Admin@1234'

  const exists = await User.findOne({ email: adminEmail })
  if (!exists) {
    await User.create({
      name:         'Admin',
      email:        adminEmail,
      passwordHash: await bcrypt.hash(adminPass, 12),
      role:         'admin',
    })
    logger.info(`Seed: admin created (${adminEmail})`)
  } else {
    logger.info('Seed: admin already exists — skipped')
  }

  // ── Demo orders (used by impact-report feature) ────────────────────────────
  const demoOrders = [
    {
      orderId:    'ORD-2024-001',
      items:      [
        { name: 'Bamboo Toothbrush Set',  qty: 50,  price: 3.5,  category: 'Personal Care' },
        { name: 'Organic Cotton Tote Bag', qty: 30, price: 8.0,  category: 'Bags'          },
      ],
      totalValue: 415,
    },
    {
      orderId:    'ORD-2024-002',
      items:      [
        { name: 'Recycled PET Water Bottle', qty: 100, price: 12.0, category: 'Drinkware' },
      ],
      totalValue: 1200,
    },
    {
      orderId:    'ORD-2024-003',
      items:      [
        { name: 'Natural Beeswax Wraps', qty: 200, price: 5.0, category: 'Kitchen' },
      ],
      totalValue: 1000,
    },
  ]

  for (const o of demoOrders) {
    await Order.updateOne({ orderId: o.orderId }, { $set: o }, { upsert: true })
  }
  logger.info(`Seed: ${demoOrders.length} demo orders upserted`)

  logger.info('Seed: done')
  process.exit(0)
}

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`)
  process.exit(1)
})
