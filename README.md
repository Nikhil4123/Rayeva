<div align="center">

# Rayeva AI - Sustainable Commerce Automation Platform

**An AI-powered B2B procurement and sustainability analytics platform**  
Automates product tagging, proposal generation, impact reporting, and customer support using **Sarvam AI**.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [AI Prompt Design](#ai-prompt-design)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Security Notes](#security-notes)
11. [License](#license)

---

## Features

| Module | Description | Status |
|--------|-------------|--------|
| **AI Product Tagger** | Classifies products into sustainability categories with confidence scores and eco-tags | Done |
| **B2B Proposal Generator** | Generates full procurement proposals with budget allocation and impact forecasts | Done |
| **Impact Reports** | Calculates per-order environmental impact (plastic saved, CO2 avoided, sourcing %) | Done |
| **WhatsApp Support Bot** | AI-powered customer support agent with conversation memory | Done |
| **Admin Dashboard** | AI log viewer, product management, and analytics overview | Done |
| **JWT Auth** | Signup / login with protected routes and rate limiting | Done |

---

## Architecture Overview

```
CLIENT (Browser)
  React 18 + Vite + Tailwind CSS + Framer Motion + Recharts
  Zustand (state) | Axios (HTTP) | React Router v6
        |
        |  HTTPS / REST
        v
BACKEND (Node.js / Express)
  Helmet | JWT Auth | Rate Limiter | CORS

  Routes:   /auth    /ai    /products    /support    /admin

        |
        v
  AI Services Layer
    geminiService.js  ->  callSarvam() with exponential-backoff retry
    promptBuilder.js  ->  builds module-specific structured prompts
    responseParser.js ->  strips markdown fences, validates JSON schema
    aiLogger.js       ->  persists every call (prompt/response/tokens/ms)

        |
        v
  Business Logic Layer
    productService | proposalService | impactService | supportService

        |          |
        v          v
    MongoDB      Redis
   (Mongoose)  (ioredis)

        |
        |  OpenAI-compatible REST
        v
  Sarvam AI  (model: sarvam-m)
  https://api.sarvam.ai/v1/chat/completions
```

### Request Flow

1. **Frontend -> Express** - React sends validated form data with a `Bearer` JWT token.
2. **Auth middleware** - `auth.js` verifies the JWT; rate limiter blocks abusive IPs.
3. **Controller -> Service** - Thin controller delegates entirely to the business logic service.
4. **Service -> AI Layer** - Service calls `promptBuilder` to construct the prompt, then `callSarvam()`.
5. **AI call** - `geminiService.js` posts to Sarvam AI with exponential-backoff retry on 429 / 503.
6. **Parse & validate** - `responseParser.js` strips markdown fences, calls `JSON.parse`, validates required fields.
7. **Log** - `aiLogger.js` writes prompt, raw response, token counts, latency, and module name to MongoDB.
8. **Cache** - Proposals and impact reports are stored in Redis to skip redundant AI calls.
9. **Response** - Clean, validated JSON returned to React.

---

## Tech Stack

### Backend

| Concern | Choice | Reason |
|---------|--------|--------|
| Runtime | Node.js 18+ | Non-blocking I/O |
| Framework | Express.js 4 | Minimal, battle-tested |
| AI Provider | Sarvam AI (`sarvam-m`) | OpenAI-compatible SDK; strong multilingual support |
| AI SDK | `openai` npm package | Drop-in OpenAI-compatible client |
| Database | MongoDB Atlas + Mongoose | Flexible schema ideal for AI log records |
| Cache | Redis + ioredis | Proposal/impact caching; rate-limit counters |
| Auth | JWT (`jsonwebtoken`) | Stateless; works with a Redis token block-list |
| Validation | Joi | Declarative request schema validation |
| Sanitization | `sanitize-html` | Strips XSS payloads from user input before prompts |
| Logging | Winston + Morgan | Structured log levels + HTTP access logs |
| Security | Helmet + CORS + Rate Limiter | OWASP-aligned production hardening |

### Frontend

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | React 18 + Vite | Fast HMR; concurrent rendering features |
| Styling | Tailwind CSS 3 | Utility-first; zero runtime overhead |
| State | Zustand | Minimal boilerplate; no prop-drilling |
| Animations | Framer Motion | Declarative, production-grade page transitions |
| Charts | Recharts | Composable, React-first chart library |
| HTTP | Axios | Interceptors for auth headers and error handling |
| Routing | React Router v6 | Nested routes; lazy page loading |
| Icons | Lucide React | Tree-shakeable SVG icon set |

---

## AI Prompt Design

All four AI modules share the same **structured JSON prompt** pattern:

> **System turn** defines the exact JSON output schema the model must return.  
> **User turn** injects sanitized, typed runtime data.  
> **`responseParser.js`** strips markdown fences, calls `JSON.parse`, and validates required keys before the data reaches business logic.

This three-part contract makes AI output predictable and safe to render directly in the UI without ad-hoc string parsing.

---

### Core AI Pipeline (`services/ai/`)

```
promptBuilder.js           geminiService.js           responseParser.js
------------------         ----------------------     ------------------
buildTaggerPrompt()   -->  callSarvam(prompt, opts)   parseJSON(rawText)
buildProposalPrompt()      - OpenAI-compat client      - strip ```json fences
buildImpactPrompt()        - temperature per module    - JSON.parse()
buildSupportPrompt()       - exponential retry         - validate required keys
                           - token usage logging       - throw on schema error
```

---

### Module 1 - Product Tagger (`productService.js`)

**Goal:** Classify a product into a sustainability category and attach eco-tags in one AI call.

**Prompt strategy:**
- All user input sanitized by `sanitizeForPrompt()` before injection (prevents prompt injection).
- Allowed `primaryCategory` values are injected from `constants.js` so the model cannot invent new categories.
- Allowed `sustainabilityTags` are enumerated inline so the model picks from the list instead of hallucinating labels.

**Output schema:**
```json
{
  "primaryCategory": "<one of the allowed list>",
  "subCategory": "<string>",
  "confidenceScore": 85,
  "sustainabilityTags": ["Organic", "Zero Waste"],
  "keywords": ["bamboo", "biodegradable"],
  "suggestedAttributes": {
    "material": "bamboo",
    "certifications": ["FSC"],
    "ecoScore": 9,
    "carbonFootprint": "low",
    "packagingType": "compostable"
  },
  "reasoning": "Product is made from sustainably harvested bamboo with FSC certification."
}
```

**Key decisions:**
- `confidenceScore` is `0-100` (not `0-1`) - avoids front-end display multiplication bugs.
- `sustainabilityTags` map 1-to-1 onto badge variants in `Badge.jsx`.
- Temperature `0.3` - low for consistent, repeatable category assignment.

---

### Module 2 - B2B Proposal Generator (`proposalService.js`)

**Goal:** Produce a full procurement proposal with product mix, budget allocation, and sustainability impact forecast.

**Prompt strategy:**
- Budget values passed as `number`, not `string` - prevents the model hallucinating currency symbols.
- `focusCategories` and `sustainabilityGoals` are individually sanitized before injection.
- `budgetAllocator.js` provides a deterministic fallback if the model omits `budgetBreakdown`.
- Result cached in Redis keyed by `sha256(companyType + targetBudget)` for 1 hour.

**Output schema:**
```json
{
  "executiveSummary": "...",
  "recommendedProductMix": [
    {
      "category": "Office Supplies",
      "productDescription": "Recycled paper notebooks",
      "allocatedBudget": 5000,
      "quantity": 500,
      "unitPrice": 10,
      "sustainabilityBenefit": "Saves 200 trees per year"
    }
  ],
  "budgetBreakdown": [
    { "category": "Office Supplies", "amount": 5000, "percentage": 25 }
  ],
  "totalEstimatedPlasticSavedKg": 120,
  "totalEstimatedCo2AvoidedKg": 340,
  "implementationTimeline": "Q1 2025 - Phase 1 rollout",
  "impactPositioningSummary": "...",
  "confidenceScore": 88
}
```

**Key decisions:**
- Temperature `0.5` - enough creativity for narrative text while keeping numbers stable.
- `budgetBreakdown` percentages validated to sum to approximately 100 in `responseParser.js`.

---

### Module 3 - Impact Report (`impactService.js`)

**Goal:** Calculate the environmental impact of a completed order.

**Prompt strategy:**
- Line items serialized as a compact JSON array to minimize token count.
- The four `badge` values are hard-coded as an enum in the prompt so the model cannot produce a fifth value.
- Report persisted to MongoDB; subsequent fetches return the stored document without a new AI call.

**Output schema:**
```json
{
  "orderId": "ord_123",
  "sustainabilityScore": 78,
  "badge": "Green Buyer",
  "plasticSavedGrams": 450,
  "carbonAvoidedGrams": 1200,
  "localSourcingPercent": 65,
  "impactStatement": "Your order prevented 450 g of single-use plastic.",
  "itemBreakdown": [
    { "productName": "Bamboo Bottle", "plasticSavedG": 300, "carbonAvoidedG": 800 }
  ]
}
```

**Key decisions:**
- `badge` constrained to exactly 4 values matching `BADGE_CONFIG` in `ImpactReports.jsx`.
- Temperature `0.2` - lowest of all modules; impact numbers must be stable across re-runs.

---

### Module 4 - WhatsApp Support Bot (`supportService.js`)

**Goal:** Reply to customer messages in a warm, sustainable-brand voice with quick-reply suggestions.

**Prompt strategy:**
- Conversation history trimmed to the **last 6 turns** before injection to avoid context overflow.
- Each history turn sanitized individually before building the prompt.
- `suggestedFollowups` constrained to a max of 3 items to fit mobile quick-reply UI.

**Output schema:**
```json
{
  "reply": "Great choice! Our bamboo bottles are BPA-free and ship in compostable packaging.",
  "suggestedFollowups": [
    "What certifications does this product have?",
    "How is it packaged?",
    "Can I buy in bulk?"
  ]
}
```

**Key decisions:**
- Temperature `0.6` - highest of all modules; conversational warmth matters more than strict determinism.
- `reply` validated as non-empty before delivery; a safe fallback message is returned on any parse failure.

---

## Project Structure

```
AI_automate/
|-- backend/
|   |-- config/
|   |   |-- db.js               # Mongoose connection with reconnect logic
|   |   |-- gemini.js           # Sarvam AI config (baseURL, model, apiKey)
|   |   `-- redis.js            # ioredis client with error handling
|   |-- controllers/            # Thin HTTP handlers - delegate to services
|   |   |-- auth.controller.js
|   |   |-- product.controller.js
|   |   |-- proposal.controller.js
|   |   |-- impact.controller.js
|   |   |-- support.controller.js
|   |   `-- admin.controller.js
|   |-- db/
|   |   |-- migrate.js          # Runs migration files in order
|   |   |-- seed.js             # Populates demo data
|   |   `-- migrations/         # Numbered .sql migration files
|   |-- middleware/
|   |   |-- auth.js             # JWT verification
|   |   |-- rateLimiter.js      # Per-IP + per-user limits (Redis-backed)
|   |   |-- validateRequest.js  # Joi schema validation
|   |   `-- errorHandler.js     # Centralised error responses
|   |-- models/                 # Mongoose schemas
|   |   |-- User.js
|   |   |-- Product.js
|   |   |-- Proposal.js
|   |   |-- Order.js
|   |   |-- ImpactReport.js
|   |   |-- AILog.js
|   |   |-- AITag.js
|   |   `-- Conversation.js
|   |-- routes/
|   |   |-- auth.routes.js
|   |   |-- ai.routes.js
|   |   |-- product.routes.js
|   |   |-- support.routes.js
|   |   `-- admin.routes.js
|   |-- services/
|   |   |-- ai/
|   |   |   |-- geminiService.js    # callSarvam() - OpenAI client + retry
|   |   |   |-- promptBuilder.js    # Per-module prompt constructors
|   |   |   |-- responseParser.js   # JSON parse + schema validation
|   |   |   `-- aiLogger.js         # Persist every AI call to MongoDB
|   |   |-- productService.js
|   |   |-- proposalService.js
|   |   |-- impactService.js
|   |   `-- supportService.js
|   |-- utils/
|   |   |-- budgetAllocator.js      # Fallback budget distribution logic
|   |   |-- constants.js            # Shared enums (categories, tags, limits)
|   |   |-- logger.js               # Winston logger configuration
|   |   `-- sanitize.js             # Input sanitization for AI prompts
|   `-- server.js                   # Express app bootstrap
|
`-- frontend/
    `-- src/
        |-- api/                    # Axios wrappers per domain
        |   |-- axiosClient.js      # Base client with auth interceptors
        |   |-- productApi.js
        |   |-- proposalApi.js
        |   |-- impactApi.js
        |   `-- logsApi.js
        |-- components/
        |   |-- layout/             # Sidebar, TopBar, Layout (page transitions)
        |   `-- ui/                 # Button, Card, Badge, Input, Alert,
        |                           # Spinner, StatCard, JSONViewer, NotificationPanel
        |-- pages/
        |   |-- Dashboard.jsx
        |   |-- ProductTagger.jsx
        |   |-- ProposalBuilder.jsx
        |   |-- ImpactReports.jsx
        |   |-- AILogs.jsx
        |   |-- Login.jsx
        |   |-- SignUp.jsx
        |   `-- Profile.jsx
        |-- store/
        |   `-- useAppStore.js      # Zustand global store
        `-- data/
            `-- mockData.js         # Local demo data for development
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** - [Atlas free tier](https://www.mongodb.com/atlas) or local `mongod`
- **Redis** - [Upstash free tier](https://upstash.com) or local `redis-server`
- **Sarvam AI API key** - [dashboard.sarvam.ai](https://dashboard.sarvam.ai)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/AI_automate.git
cd AI_automate

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Frontend
cd ../frontend
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run database migrations

```bash
cd backend
node db/migrate.js      # Creates collections and indexes
node db/seed.js         # (Optional) Loads demo data
```

### 4. Start development servers

```bash
# Terminal 1 - Backend  ->  http://localhost:5000
cd backend && npm run dev

# Terminal 2 - Frontend ->  http://localhost:5173
cd frontend && npm run dev
```

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Express server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/rayeva` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret (32+ chars recommended) | `change-me-in-production-32-chars` |
| `SARVAM_API_KEY` | Sarvam AI API key | `sk_v0_...` |
| `SARVAM_BASE_URL` | Sarvam AI base URL | `https://api.sarvam.ai/v1` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173,https://your-app.vercel.app` |
| `NODE_ENV` | Environment | `development` |

### `frontend/.env.local`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |

> **Never commit `.env` files.** Both are listed in `.gitignore`.

---

## API Reference

All endpoints except `GET /health` and `POST /auth/*` require:

```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |
| `GET` | `/auth/me` | Get the current user profile |

### Products & AI Tagging

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/tag-product` | Tag and categorise a product via AI |
| `GET` | `/products` | List all saved products |
| `GET` | `/products/:id` | Get a product with its AI tags |
| `DELETE` | `/products/:id` | Delete a product |

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/generate-proposal` | Generate a B2B procurement proposal |
| `GET` | `/ai/proposals` | List all generated proposals |
| `GET` | `/ai/proposals/:id` | Get a single proposal |

### Impact Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/impact-report` | Generate impact report for an order |
| `GET` | `/ai/impact-reports` | List all impact reports |

### Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/support/chat` | Send a message to the AI support bot |
| `GET` | `/support/conversations` | List support conversations |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/ai-logs` | Paginated AI call log viewer |
| `GET` | `/admin/stats` | Platform usage statistics |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check - returns `{ "status": "ok" }` |

---

## Deployment

### Backend -> Render

1. Create a **Web Service** on [render.com](https://render.com).
2. Connect the repo; set **Root Directory** to `backend/`.
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. Add all environment variables from the table above.
6. Set `NODE_ENV=production`.

### Frontend -> Vercel

1. Import the repo on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend/`.
3. **Framework preset:** Vite (auto-detected).
4. Add `VITE_API_BASE_URL` pointing to your Render backend URL.
5. The `vercel.json` rewrite rule is already included for client-side routing.
6. Click **Deploy**.

---

## Security Notes

- All user input that reaches AI prompts is sanitized by `sanitize.js` (strips HTML, enforces length limits) to prevent **prompt injection** attacks.
- Passwords are hashed with **bcryptjs** before storage - never stored in plain text.
- **Helmet** sets secure HTTP headers (CSP, X-Frame-Options, HSTS) on every response.
- **Rate limiting** is enforced per-IP and per-user via Redis-backed counters.
- **CORS** is locked to an explicit origin allowlist via `ALLOWED_ORIGINS`.
- JWT secrets should be 32+ characters; rotate immediately if leaked.
- `.env` files are in `.gitignore` - never commit credentials to source control.

---

## License

[MIT](LICENSE) - (c) 2025 Rayeva AI
