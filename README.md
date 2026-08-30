# RecoverMandate

**AI-powered revenue recovery engine for failed recurring payments**  
Built for Razorpay Buildathon — Track 3: AI Revenue Recovery

🔗 **Live Demo:** https://recover-mandate.vercel.app  
📹 **Video Walkthrough:** https://www.loom.com/share/9f617dd9e71743afb3496eb01ee7ce15

## Problem

Indian subscription businesses silently lose 15–20% of recurring revenue — not to fraud, but to mismanaged failure recovery. When a recurring payment fails due to an expired e-mandate, an expired card, or a bank requiring OTP/AFA authentication, most systems respond with the same blind retry regardless of cause.

## Solution

RecoverMandate diagnoses the actual root cause of each failed recurring payment using real Razorpay error codes, then routes it to the specific intervention that failure type needs:

| Failure Cause | Action |
|---|---|
| Mandate expired | Send e-mandate re-registration link |
| Card expired | Prompt to update saved card |
| OTP/AFA required | Route through authentication retry flow |
| Bank transient error | Smart retry after delay |
| Insufficient funds | Gentle reminder before retry |
| Unrecognized cause | Flag for manual review |

## Results

- **Total at risk:** ₹23+ lakh
- **Baseline recovery** (generic retry for all): 15%
- **RecoverMandate recovery**: **~48%** — roughly 3x improvement
- **Diagnosis accuracy:** 100%

## AI Layer

Every diagnosed decision includes a plain-English, AI-generated explanation via Google's Gemini API, building a genuine audit trail. Diagnosis and routing logic remain deterministic rules for guaranteed auditability; AI is used specifically for natural language explanation generation.

## Tech Stack

- **Frontend:** Plain HTML/CSS/JavaScript
- **Backend:** Vercel serverless function (`/api/explain`)
- **AI:** Google Gemini API
- **Hosting:** Vercel

## Architecture

See diagram below. Frontend handles diagnosis and recovery math (deterministic, auditable). Backend serverless function securely calls Gemini API for explanations only.

| Layer | Responsibility | Why |
|---|---|---|
| Frontend | Diagnosis, routing, recovery math | Fast, deterministic, fully auditable |
| Backend | AI explanation generation | Keeps API key secure |
| AI (Gemini) | Natural language generation only | Used only where it adds value |

## Key Engineering Decisions

- Deterministic diagnosis, AI explanation — ensures auditability while using genuine AI where valuable
- Cached AI explanations for demo reliability (free tier allows 20 requests/day)
- Graceful failure handling — unrecognized codes flagged for manual review
- Dataset-agnostic design via fixed internal schema

## Build Challenges & Solutions

- **Deprecated AI model:** Switched from deprecated `gemini-1.5-flash` to current supported model after debugging via error logging
- **API quota limits:** Cached real AI-generated explanations to avoid free-tier quota exhaustion during demos
- **Secure backend for AI calls:** Moved to Vercel to add a serverless function, keeping the API key server-side

## Business Value for Razorpay

- More successful transaction volume recovered through Razorpay's own rails
- Sellable retention feature for Razorpay Subscriptions
- Compliance-friendly, explainable decisions aligned with RBI regulations

## Limitations

Hackathon proof-of-concept using synthetic data modeled on real Razorpay error codes and RBI regulations. Success-rate assumptions are explicitly stated modeling estimates, not measured from live data.# RecoverMandate                         

##ARCHITECTURE
Data (data.js) -> Diagnosis Engine (engine.js) -> Frontend Dashboard (app.js) -> Backend API (api/explain.js) -> Google Gemini API -> AI Explanation returned to Dashboard

