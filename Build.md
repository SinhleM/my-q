my-q/
├── .next/
├── node_modules/
├── public/
│   ├── fonts/
│   ├── myq-logo-removeb.png
│   └── myq-logo.png
├── src/
│   ├── app/
│   │   ├── (AUTH)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── components/
│   │   │   │       ├── analytics/index.tsx
│   │   │   │       ├── files/index.tsx
│   │   │   │       ├── overview/index.tsx
│   │   │   │       ├── payments/index.tsx
│   │   │   │       ├── settings/index.tsx
│   │   │   │       └── sidebar/index.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── 
│   │   │   ├── auth/callback/route.ts
│   │   │   ├── files/
│   │   │   │   ├── [fileId]/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── [paymentId]/route.ts
│   │   │   │   └── payfast/
│   │   │   │       ├── initiate/route.ts
│   │   │   │       ├── notify/route.ts
│   │   │   │       └── request/route.ts
│   │   │   ├── profile/route.ts
│   │   │   └── qr/generate/route.ts
│   │   ├── files/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── q/
│   │   │   └── [username]/page.tsx
│   │   ├── layout.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── files/FileUploadSection.tsx
│   │   ├── landing/page.tsx
│   │   ├── layout/
│   │   ├── payments/PaySection.tsx
│   │   ├── profile/ContactSection.tsx
│   │   ├── qr/QRCard.tsx
│   │   └── ui/
│   │       ├── Footer.tsx
│   │       └── Header.tsx
│   ├── hooks/
│   └── lib/
│       ├── files/storage.ts
│       ├── payfast/initiate.ts
│       ├── qr/generate.ts
│       ├── supabase/
│       │   ├── client.ts
│       │   └── server.ts
│       └── utils.ts
├── types/index.ts
├── supabase/migrations/001_initial.sql
├── .env
├── .gitignore
├── AGENTS.md
├── Build.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
└── postcss.config.mjs