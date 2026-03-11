// ─────────────────────────────────────────────────────────────────────────────
// Mock data for demo / offline mode.
// All shapes match the real API response schemas exactly.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TAG_RESULT = {
  product_id: 'demo-prod-001',
  primary_category: 'Personal Care',
  sub_category: 'Oral Hygiene',
  seo_tags: [
    'bamboo toothbrush',
    'eco toothbrush',
    'compostable toothbrush',
    'zero waste oral care',
    'charcoal toothbrush',
    'plastic-free toothbrush',
    'sustainable oral hygiene',
  ],
  sustainability_filters: ['plastic-free', 'compostable', 'biodegradable', 'vegan'],
  confidence_score: 0.97,
  classification_reason:
    'Bamboo-based oral care product with charcoal bristles and plastic-free packaging. All materials are compostable.',
  ai_log_id: 'demo-log-001',
  cached: false,
}

export const MOCK_PROPOSAL_RESULT = {
  proposal_id: 'demo-prop-001',
  proposal_title: 'Plastic-Free Office Transformation — Tech Startup',
  company_type: 'tech_startup',
  sustainability_focus: 'Plastic-free office operations and zero-waste culture',
  product_mix: [
    {
      category: 'Recycled Stationery',
      product_description: 'Recycled paper notebooks, pens from reclaimed ocean plastic',
      rationale: 'Reduces daily plastic waste from routine office supplies',
      allocated_budget: 15000,
      budget_percentage: 30,
      estimated_units: 200,
      estimated_plastic_saved_kg: 12.5,
      estimated_co2_avoided_kg: 8.3,
    },
    {
      category: 'Organic Cleaning Supplies',
      product_description: 'Concentrated plant-based cleaners, refillable glass dispensers',
      rationale: 'Eliminates single-use plastic bottles from facility management',
      allocated_budget: 10000,
      budget_percentage: 20,
      estimated_units: 50,
      estimated_plastic_saved_kg: 25.0,
      estimated_co2_avoided_kg: 15.2,
    },
    {
      category: 'Compostable Tableware',
      product_description: 'Cornstarch cutlery, sugarcane plates, paper cups',
      rationale: 'Entirely eliminates single-use plastic in the office pantry',
      allocated_budget: 12500,
      budget_percentage: 25,
      estimated_units: 5000,
      estimated_plastic_saved_kg: 30.0,
      estimated_co2_avoided_kg: 18.5,
    },
    {
      category: 'Reusable Packaging',
      product_description: 'Branded tote bags, beeswax wraps, glass containers for deliveries',
      rationale: 'Reduces packaging waste from internal logistics and client gifts',
      allocated_budget: 10000,
      budget_percentage: 20,
      estimated_units: 150,
      estimated_plastic_saved_kg: 13.0,
      estimated_co2_avoided_kg: 10.7,
    },
  ],
  budget_summary: {
    total_budget: 50000,
    total_allocated: 47500,
    recommended_reserve: 2500,
    reserve_reason: 'Buffer for shipping, logistics and first-month replenishment',
  },
  impact_positioning_summary:
    "By switching to Rayeva's curated sustainable products, your team eliminates an estimated 80.5 kg of single-use plastic annually — equivalent to removing over 1,600 plastic bottles from circulation. This initiative strengthens your ESG reporting credentials and positions your brand as an employer of choice for sustainability-conscious talent.",
  total_estimated_plastic_saved_kg: 80.5,
  total_estimated_co2_avoided_kg: 52.7,
  implementation_timeline: '4–6 weeks',
  confidence_score: 0.88,
  ai_log_id: 'demo-log-002',
}

export const MOCK_IMPACT_REPORT = {
  report_id: 'demo-report-001',
  order_id: 'ORD-2026-001234',
  plastic_saved_grams: 320,
  carbon_avoided_grams: 180,
  local_sourcing_percent: 65,
  trees_equivalent: 0.02,
  reuse_multiplier: 10,
  impact_statement:
    'Your purchase of 4 sustainable products saved 320 g of plastic and avoided 180 g of CO₂ emissions — equivalent to powering a smartphone for 3 days. 65% of your order was locally sourced, significantly cutting transport emissions.',
  item_breakdown: [
    { product_name: 'Bamboo Toothbrush Set (×4)', plastic_saved_g: 120, carbon_avoided_g: 60 },
    { product_name: 'Organic Cotton Tote Bag', plastic_saved_g: 200, carbon_avoided_g: 120 },
  ],
  sustainability_score: 82,
  badge: 'Eco Champion',
}

export const MOCK_AI_LOGS = [
  {
    id: 'log-001',
    module: 'product_tagger',
    model: 'gemini-1.5-pro',
    status: 'success',
    latency_ms: 1240,
    tokens_used: 834,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    prompt: 'Classify the following product for the Rayeva sustainable marketplace.\n\nProduct Title: Bamboo Toothbrush - Charcoal Pack of 4\nProduct Description: FSC-certified bamboo handle...',
    raw_response: '{"primary_category":"Personal Care","sub_category":"Oral Hygiene","seo_tags":["bamboo toothbrush","eco toothbrush"],"sustainability_filters":["plastic-free","compostable"],"confidence_score":0.97}',
  },
  {
    id: 'log-002',
    module: 'b2b_proposal',
    model: 'gemini-1.5-pro',
    status: 'success',
    latency_ms: 2180,
    tokens_used: 1204,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    prompt: 'Generate a sustainable product procurement proposal for... Company Type: tech_startup, Budget: INR 50000...',
    raw_response: '{"proposal_title":"Plastic-Free Office Transformation","product_mix":[...],"confidence_score":0.88}',
  },
  {
    id: 'log-003',
    module: 'product_tagger',
    model: 'gemini-1.5-pro',
    status: 'parse_error',
    latency_ms: 450,
    tokens_used: 0,
    error_message: 'AI returned markdown-wrapped response, stripping failed',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    prompt: 'Classify the following product...',
    raw_response: null,
  },
  {
    id: 'log-004',
    module: 'impact_report',
    model: 'gemini-1.5-pro',
    status: 'success',
    latency_ms: 1580,
    tokens_used: 976,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    prompt: 'Generate an environmental impact report for order ORD-2026-001234...',
    raw_response: '{"plastic_saved_grams":320,"carbon_avoided_grams":180,"badge":"Eco Champion"}',
  },
  {
    id: 'log-005',
    module: 'b2b_proposal',
    model: 'gemini-1.5-pro',
    status: 'api_error',
    latency_ms: 8200,
    tokens_used: 0,
    error_message: 'Gemini API returned 429 Too Many Requests — rate limit exceeded',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    prompt: 'Generate a sustainable product procurement proposal for... Company Type: hospitality...',
    raw_response: null,
  },
  {
    id: 'log-006',
    module: 'product_tagger',
    model: 'gemini-1.5-pro',
    status: 'success',
    latency_ms: 1100,
    tokens_used: 720,
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    prompt: 'Classify: Organic Beeswax Food Wrap Set...',
    raw_response: '{"primary_category":"Kitchen & Dining","sub_category":"Food Storage","seo_tags":["beeswax wrap","plastic-free storage"],"confidence_score":0.94}',
  },
]

export const MOCK_DASHBOARD_STATS = {
  products_tagged: 247,
  proposals_generated: 38,
  ai_calls_today: 1243,
  success_rate: 97.8,
}

export const MOCK_RECENT_ACTIVITY = MOCK_AI_LOGS.slice(0, 5)
