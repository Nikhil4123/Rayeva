// ─── Sustainability & taxonomy constants ──────────────────────────────────────

const PRIMARY_CATEGORIES = [
  'Electronics',
  'Clothing & Apparel',
  'Home & Kitchen',
  'Food & Beverages',
  'Health & Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Books & Media',
  'Automotive',
  'Garden & Outdoor',
  'Office Supplies',
  'Industrial & Scientific',
  'Pet Supplies',
  'Jewelry & Accessories',
  'Baby & Kids',
]

const SUSTAINABILITY_FILTERS = [
  'Eco-Friendly',
  'Organic',
  'Recycled Materials',
  'Biodegradable',
  'Carbon Neutral',
  'Fair Trade',
  'Vegan',
  'Zero Waste',
  'Energy Efficient',
  'Sustainable Packaging',
  'Upcycled',
  'Locally Sourced',
]

const COMPANY_TYPES = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Manufacturer',
  'E-commerce Brand',
  'Marketplace Seller',
]

const BUDGET_CATEGORIES = [
  'premium',
  'sustainable_premium',
  'mid_range',
  'eco_friendly',
  'budget',
]

// JWT / auth
const ACCESS_TOKEN_EXPIRY  = process.env.ACCESS_TOKEN_EXPIRY  || '1d'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'

// AI retry config
const AI_MAX_RETRIES     = 3
const AI_BASE_DELAY_MS   = 2000  // doubles each retry: 2 s → 4 s → 8 s

// Cache TTLs (seconds)
const CACHE_TTL_PRODUCT_TAG = 24 * 60 * 60  // 24 hours
const CACHE_TTL_PROPOSAL    = 60 * 60        // 1 hour
const CACHE_TTL_IMPACT      = 30 * 60        // 30 minutes

module.exports = {
  PRIMARY_CATEGORIES,
  SUSTAINABILITY_FILTERS,
  COMPANY_TYPES,
  BUDGET_CATEGORIES,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  AI_MAX_RETRIES,
  AI_BASE_DELAY_MS,
  CACHE_TTL_PRODUCT_TAG,
  CACHE_TTL_PROPOSAL,
  CACHE_TTL_IMPACT,
}
