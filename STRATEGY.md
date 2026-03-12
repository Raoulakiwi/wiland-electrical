# CallPilot - White-Label AI Call Centre Platform

## Executive Summary

Transform Wiland Electrical from a single business solution into a **multi-tenant SaaS platform** where marketing companies and agencies can offer AI-powered phone reception to their clients.

---

## The Vision

**VoiceAI** (working name) enables agencies to:
- Resell AI call handling under their own brand
- Add clients without technical knowledge
- Monitor all their clients' calls from one dashboard
- Set custom pricing/rates for their clients

**Target Market:**
- Marketing agencies with SME clients
- Business consultants
- Franchise systems
- Any company managing multiple small businesses

---

## Architecture

### Multi-Tenant Design

```
┌─────────────────────────────────────────────────────┐
│                  VoiceAI Platform                    │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Tenant A  │  │   Tenant B  │  │   Tenant C  │ │
│  │  (Agency)   │  │  (Agency)   │  │  (Agency)   │ │
│  │             │  │             │  │             │ │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │ │
│  │ │ Client1 │ │  │ │ Client1 │ │  │ │ Client1 │ │ │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │ │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │             │ │
│  │ │ Client2 │ │  │ │ Client2 │ │  │             │ │
│  │ └─────────┘ │  │ └─────────┘ │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|----------|------------|
| Frontend | React + Vercel |
| Backend | FastAPI + SQLite (per-tenant) |
| Voice AI | MiniMax Speech 2.6 + OpenRouter |
| Phone | Twilio (sub-accounts per tenant) |
| Auth | JWT + Role-based |
| Payments | Stripe (subscriptions) |

---

## Data Models

### Tenants (Agencies)
```python
{
  id: uuid,
  name: str,                    # "Acme Marketing"
  brand_name: str,              # "Acme AI Reception"
  brand_logo: url,
  brand_colors: str,            # hex colors for theming
  webhook_url: str,             # for call notifications
  subscription_tier: str,       # basic/pro/enterprise
  twilio_account_sid: str,     # agency Twilio (optional)
  created_at: datetime
}
```

### Clients (End Businesses)
```python
{
  id: uuid,
  tenant_id: uuid,              # agency owning this client
  business_name: str,
  phone_number: str,            # assigned or ported
  greeting_message: str,
  voice_personality: str,       # professional/friendly/formal
  services_offered: list,
  operating_hours: dict,
  notify_config: dict,
  status: str,                 # active/paused/trial
  created_at: datetime
}
```

### Calls
```python
{
  id: uuid,
  client_id: uuid,
  caller_number: str,
  direction: str,              # inbound/outbound
  duration: int,
  transcript: text,
  summary: text,
  outcome: str,                # booked/message/redirect/failed
  cost: decimal,
  timestamp: datetime
}
```

---

## Feature Roadmap

### Phase 1: Platform Foundation (Month 1-2)
- [ ] Multi-tenant authentication & authorization
- [ ] Tenant onboarding flow (self-serve)
- [ ] Basic dashboard for agencies
- [ ] Client management (add/edit/remove)
- [ ] Twilio phone number provisioning
- [ ] Basic AI voice reception
- [ ] Call logging & basic analytics

### Phase 2: AI Intelligence (Month 2-3)
- [ ] Custom AI prompts per client
- [ ] Service/product knowledge base per client
- [ ] Appointment booking system
- [ ] SMS confirmations
- [ ] Voicemail handling
- [ ] After-hours routing

### Phase 3: Notifications & CRM (Month 3-4)
- [ ] Daily/weekly summaries per client
- [ ] Agency-wide reporting
- [ ] Webhook integrations (Zapier, etc.)
- [ ] Client portal for end businesses
- [ ] Call transcription storage

### Phase 4: Scale (Month 4-6)
- [ ] Multi-language support
- [ ] Outbound calling capabilities
- [ ] Quote generation
- [ ] Payment integration (Stripe)
- [ ] Usage-based billing
- [ ] API for third-party integrations

---

## Pricing Model

### Suggested Tiers

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Monthly Cost | $99/mo | $299/mo | Custom |
| Clients | 3 | 15 | Unlimited |
| Minutes Included | 500 | 2,000 | Unlimited |
| Phone Numbers | 3 | 15 | Unlimited |
| Custom Branding | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |

### Revenue Share Option
- Agencies can add their own margin
- Platform takes 20% of phone costs + fixed per-minute rate

---

## Implementation Plan

### Step 1: Architecture (Week 1-2)
- [ ] Design multi-tenant database schema
- [ ] Set up Vercel project structure
- [ ] Configure auth system (JWT)
- [ ] Define API contracts

### Step 2: Agency Portal (Week 3-4)
- [ ] Agency signup/login
- [ ] Dashboard with client list
- [ ] Add client form (business info, hours, services)
- [ ] Phone number assignment

### Step 3: Client Configuration (Week 5-6)
- [ ] Client-specific AI prompt builder
- [ ] Operating hours configuration
- [ ] Voice personality selection
- [ ] Notification preferences

### Step 4: Voice Integration (Week 7-8)
- [ ] Twilio webhook handler
- [ ] MiniMax Speech integration
- [ ] Call flow logic (business hours, emergency, etc.)
- [ ] Recording & transcription

### Step 5: Testing & Launch (Week 9-10)
- [ ] Load testing
- [ ] Security audit
- [ ] Beta with 3-5 agencies
- [ ] Marketing materials

---

## Success Metrics

- **MRR Target:** $10,000 by Month 6
- **Customer Acquisition Cost:** <$500
- **Churn Rate:** <5% monthly
- **NPS Score:** >50

---

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Twilio costs spiral | Set per-client limits, auto-pause |
| AI quality issues | Human fallback option, QA process |
| Competition | Focus on ease-of-use, white-label |
| Legal/compliance | Data residency options, GDPR |

---

## Next Steps

1. **Approval:** Confirm to proceed with platform build
2. **Branding:** Choose platform name ("VoiceAI", "CallPilot", etc.)
3. **Funding:** Determine budget for development
4. **Timeline:** Set target launch date
5. **Team:** Identify resources needed (dev, marketing, sales)

---

*Document Version: 1.0*
*Created: 2026-03-12*
*Status: Awaiting Approval*
