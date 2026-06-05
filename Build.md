qr-identity/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx          # QR overview, stats, activity feed
│   │   ├── profile/
│   │   │   └── page.tsx          # Edit contact info, social links
│   │   ├── files/
│   │   │   └── page.tsx          # Manage shared/received files
│   │   └── payments/
│   │       └── page.tsx          # Payment requests, history
│   ├── q/
│   │   └── [username]/
│   │       └── page.tsx          # Public QR landing page (no auth required)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...supabase]/
│   │   │       └── route.ts
│   │   ├── qr/
│   │   │   └── generate/
│   │   │       └── route.ts      # QR code generation endpoint
│   │   ├── files/
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── [fileId]/
│   │   │       └── route.ts      # Download / delete
│   │   ├── payments/
│   │   │   ├── request/
│   │   │   │   └── route.ts
│   │   │   ├── payfast/
│   │   │   │   ├── initiate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── notify/
│   │   │   │       └── route.ts  # PayFast ITN webhook
│   │   │   └── [paymentId]/
│   │   │       └── route.ts
│   │   └── profile/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx                  # Landing/marketing page
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── qr/
│   │   ├── QRCard.tsx            # Displays user's QR code
│   │   └── QRScanner.tsx         # Optional in-browser scan
│   ├── profile/
│   │   ├── ContactCard.tsx       # Public-facing contact display
│   │   └── ProfileForm.tsx
│   ├── files/
│   │   ├── FileUpload.tsx
│   │   ├── FileList.tsx
│   │   └── FileItem.tsx
│   ├── payments/
│   │   ├── PaymentRequest.tsx
│   │   └── PayFastButton.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── DashboardShell.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (cookies)
│   │   └── middleware.ts
│   ├── qr/
│   │   └── generate.ts           # qrcode or qr-image wrapper
│   ├── payfast/
│   │   ├── initiate.ts           # Build PayFast form payload
│   │   └── verify.ts             # ITN signature verification
│   ├── files/
│   │   └── storage.ts            # Supabase storage helpers
│   └── utils.ts
├── hooks/
│   ├── useProfile.ts
│   ├── useFiles.ts
│   └── usePayments.ts
├── types/
│   └── index.ts                  # Shared TS types (Profile, File, Payment, etc.)
├── middleware.ts                  # Auth protection for /dashboard routes
├── .env.local
├── supabase/
│   └── migrations/               # SQL migration files
│       └── 001_initial.sql
└── next.config.ts