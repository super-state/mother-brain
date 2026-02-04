# UK Coffee Discovery

A community-driven specialty coffee discovery platform for the UK.

## Vision
Discover, rate, and track the best specialty coffee in the UK - no more pubs serving instant!

## Features
- 🔍 **Discover** - Find specialty coffee shops across the UK
- ⭐ **Rate & Review** - Share your experiences with the community
- ✅ **Track Progress** - Mark visited shops, build your coffee journey
- 🗺️ **Plan Routes** - Create multi-stop coffee adventures

## Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend/Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: TailwindCSS with custom design system
- **Maps**: Mapbox GL JS
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Mapbox credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Project Structure
```
uk-coffee-discovery/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
│   ├── ui/                 # Base UI components
│   ├── shop/               # Shop-related components
│   ├── review/             # Review components
│   └── map/                # Map components
├── lib/                    # Utilities and clients
│   ├── supabase.ts         # Supabase client
│   └── hooks/              # Custom React hooks
├── types/                  # TypeScript types
└── .github/skills/         # Project-specific AI skills
```

## Design System
See `.github/skills/design-system/SKILL.md` for:
- Color palette (warm coffee tones)
- Typography (Plus Jakarta Sans, Inter)
- Spacing system
- Component patterns

## Development
See `.mother-brain/docs/roadmap.md` for the full development roadmap.

## License
MIT
