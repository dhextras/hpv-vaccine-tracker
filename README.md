# HPV Vaccine Tracker

A web application to help parents and young adults track HPV vaccination progress, find clinics, and manage vaccine schedules.

## Features

- Two user modes: Parent/Guardian (multi-child) and Young Adult (single user)
- Vaccine eligibility screening based on medical history
- Dose tracking and scheduling (2-dose or 3-dose series)
- Symptom checker with triage logic
- Clinic directory with search and contact options
- Educational resources about HPV and vaccination
- Progress tracking with visual milestones
- Vaccine card photo upload

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- Zustand for state management
- date-fns for date handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

### Lint

Run ESLint:

```bash
npm run lint
```

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── onboarding/          # Onboarding flow screens
│   │   ├── mode/           # Mode selection
│   │   ├── profile/        # Profile creation
│   │   ├── screening/      # Safety screening
│   │   ├── eligibility/    # Eligibility results
│   │   └── symptoms/       # Symptom checker
│   ├── dashboard/          # Main app tabs
│   │   ├── home/          # Home dashboard
│   │   ├── vaccine-plan/  # Dose tracking
│   │   ├── learn/         # Educational content
│   │   └── help/          # Clinic directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── onboarding/       # Onboarding components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities and logic
│   ├── supabase/        # Supabase clients
│   ├── types/           # TypeScript types
│   └── utils/           # Business logic
│       ├── eligibility.ts
│       ├── scheduling.ts
│       └── triage.ts
└── public/              # Static assets
    └── config/          # Configuration files
```

## Configuration

### Program Configuration

Edit `/public/config/program_config.json` to customize eligibility rules:

- `min_age_years`: Minimum age for vaccination
- `routine_age_max_years`: Maximum age for routine vaccination
- `sex_eligibility`: "all" or "female_only"
- `dose2_months_after_dose1`: Months between doses for 2-dose series
- `allow_catchup_age_max_years`: Maximum age for catch-up vaccination

### Clinic Directory

Edit `/public/config/clinics.json` to add clinic information.

## Database Schema

See `CLAUDE.md` for detailed database schema information.

## Supabase Setup

1. Create a Supabase project
2. Run the SQL migrations in `/supabase/migrations/` (to be created)
3. Set up Row Level Security policies
4. Configure Storage buckets for vaccine card photos
5. Add your credentials to `.env`

## Coding Standards

- No comments in code
- No emojis in code
- TypeScript strict mode enabled
- Self-documenting code with descriptive names
- Prettier formatting

## License

ISC
