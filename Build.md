qr-identity/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── files/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── api/
│   │   │   ├── auth/callback/route.ts
│   │   │   ├── files/
│   │   │   │   ├── [fileId]/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── [paymentId]/route.ts
│   │   │   │   ├── payfast/
│   │   │   │   │   ├── initiate/route.ts
│   │   │   │   │   └── notify/route.ts
│   │   │   │   └── request/route.ts
│   │   │   ├── profile/route.ts
│   │   │   └── qr/generate/route.ts
│   │   ├── payments/
│   │   │   ├── cancelled/page.tsx
│   │   │   └── success/page.tsx
│   │   ├── q/[username]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── files/
│   │   │   ├── FileList.tsx
│   │   │   └── FileUploadSection.tsx
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   ├── payments/
│   │   │   ├── NewPaymentRequest.tsx
│   │   │   ├── PaySection.tsx
│   │   │   └── PaymentsList.tsx
│   │   ├── profile/
│   │   │   ├── ContactSection.tsx
│   │   │   └── ProfileForm.tsx
│   │   ├── qr/
│   │   │   └── QRCard.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── useFiles.ts
│   │   ├── usePayments.ts
│   │   └── useProfile.ts
│   ├── lib/
│   │   ├── files/storage.ts
│   │   ├── payfast/
│   │   │   ├── initiate.ts
│   │   │   └── verify.ts
│   │   ├── qr/generate.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── proxy.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── public/
│   └── fonts/
├── .env.local
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json