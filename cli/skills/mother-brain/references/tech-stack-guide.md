# Technology Stack Decision Guide

## Quick Reference for Common Project Types

### Web Application (Full Stack)
**Best for**: SaaS products, dashboards, collaborative tools

**Recommended Stack**:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js (Express/Fastify) or Python (FastAPI)
- Database: PostgreSQL or MongoDB
- Auth: Auth0, Supabase, or Firebase Auth
- Hosting: Vercel (frontend) + Railway/Render (backend)

**Why**: Modern, widely supported, strong ecosystem, fast development

---

### Mobile Application
**Best for**: Consumer apps, on-the-go tools

**Recommended Stack**:
- Framework: React Native or Flutter
- Backend: Firebase or Supabase (BaaS)
- State Management: Redux Toolkit or Riverpod
- Analytics: Firebase Analytics or Amplitude

**Why**: Write once, deploy iOS + Android, native performance

---

### Desktop Application
**Best for**: Professional tools, productivity apps, offline-first

**Recommended Stack**:
- Cross-platform: Electron + React
- Windows-specific: WinUI 3 + .NET
- Mac-specific: SwiftUI
- Linux: Qt or GTK

**Why**: Native feel, full system access, offline capabilities

---

### API / Backend Service
**Best for**: Microservices, data processing, integrations

**Recommended Stack**:
- Python: FastAPI (modern, fast, auto-docs)
- Node.js: Express or Fastify (JavaScript ecosystem)
- .NET: ASP.NET Core (enterprise, high performance)
- Go: Gin or Echo (extreme performance)

**Database**:
- Relational: PostgreSQL
- Document: MongoDB
- Key-Value: Redis
- Time-series: InfluxDB

**Why**: Optimized for specific use case, scales well

---

### Data Science / ML Project
**Best for**: Analytics, predictions, insights

**Recommended Stack**:
- Language: Python 3.11+
- Notebooks: Jupyter Lab
- Data: Pandas, Polars (faster alternative)
- Visualization: Plotly, Matplotlib
- ML: scikit-learn, PyTorch, TensorFlow
- Deployment: FastAPI + Docker

**Why**: Rich ecosystem, community support, proven tools

---

### Static Website / Blog
**Best for**: Marketing sites, documentation, blogs

**Recommended Stack**:
- Framework: Next.js, Gatsby, or Astro
- CMS: Contentful, Sanity, or MDX
- Hosting: Vercel, Netlify, or Cloudflare Pages
- Styling: Tailwind CSS

**Why**: Lightning fast, SEO-friendly, free hosting

---

### E-Commerce
**Best for**: Online stores, marketplaces

**Recommended Stack**:
- Platform: Shopify (hosted) or WooCommerce
- Custom: Next.js + Stripe + Sanity CMS
- Cart: Snipcart or Commerce.js
- Payments: Stripe or PayPal

**Why**: Secure payments, inventory management, shipping integrations

---

### Real-Time Application
**Best for**: Chat apps, collaborative editors, live dashboards

**Recommended Stack**:
- Frontend: React + Socket.io or WebSockets
- Backend: Node.js + Socket.io
- Database: Redis (pub/sub) + PostgreSQL
- Infrastructure: Heroku or AWS

**Why**: Low latency, bidirectional communication

---

## Decision Matrix

| Priority | Choose... |
|----------|-----------|
| Speed to market | No-code (Bubble, Webflow) or BaaS (Firebase, Supabase) |
| Scalability | Cloud-native (AWS, GCP, Azure) + containerization |
| Cost-effective | Open source stack + free tiers (Vercel, Render, Supabase) |
| Enterprise ready | .NET, Java Spring Boot, PostgreSQL |
| Developer productivity | TypeScript + modern framework + Copilot |
| Performance critical | Go, Rust, or C++ |

## Technology Evaluation Checklist

When selecting technologies, consider:

✅ **Community Size**: Active community = more resources, packages, help
✅ **Documentation Quality**: Good docs save days of debugging
✅ **Long-term Viability**: Is the tech actively maintained?
✅ **Hiring Pool**: Can you find developers who know it?
✅ **Learning Curve**: How quickly can team become productive?
✅ **Ecosystem**: Are there good libraries, tools, integrations?
✅ **Performance**: Does it meet your scale requirements?
✅ **Cost**: Licensing, hosting, third-party services

## Red Flags (Avoid These)

❌ **Dead Projects**: Last commit > 2 years ago
❌ **Single Maintainer**: Bus factor of 1
❌ **Overly Complex**: Requires PhD to understand
❌ **Hyped but Immature**: Trendy but production-untested
❌ **Vendor Lock-in**: Impossible to migrate away
❌ **Poor Security**: History of vulnerabilities

## When in Doubt...

**For Prototypes**: Use whatever you know best + fastest
**For MVPs**: Modern, popular stack with good docs
**For Scale**: Battle-tested, boring technology
**For Unique Needs**: Research thoroughly, POC first

---

**Last Updated**: 2026-02-03
**Source**: Aggregate best practices from Stack Overflow Survey, GitHub, ThoughtWorks Radar
