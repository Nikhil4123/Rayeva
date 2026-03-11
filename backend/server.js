require('dotenv').config()
const express  = require('express')
const helmet   = require('helmet')
const cors     = require('cors')
const morgan   = require('morgan')

const { connect } = require('./config/db')

const authRoutes    = require('./routes/auth.routes')
const aiRoutes      = require('./routes/ai.routes')
const supportRoutes = require('./routes/support.routes')
const adminRoutes   = require('./routes/admin.routes')
const productRoutes = require('./routes/product.routes')
const errorHandler  = require('./middleware/errorHandler')
const logger        = require('./utils/logger')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }),
)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth',     authRoutes)
app.use('/ai',       aiRoutes)
app.use('/products', productRoutes)
app.use('/support',  supportRoutes)
app.use('/admin',    adminRoutes)

// ── 404 Catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────
connect().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Rayeva AI backend running on http://localhost:${PORT}`)
    logger.info(`   ENV: ${process.env.NODE_ENV || 'development'}`)
  })
})

module.exports = app
