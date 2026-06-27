my-q/
├── public/
│   ├── fonts/
│   │   ├── Aeonik-Regular.ttf
│   │   └── Aeonik-Regular1.ttf
│   ├── profile-icons/
│   │   └── square-crop (1-8).webp, square-crop.webp
│   ├── bg.png
│   ├── logo.png
│   ├── myq-logo.png / myq-logo-removebg.png
│   ├── payfast-logo.png
│   └── Screenshot 2026-06-15 1145322.png
├── src/
│   ├── app/
│   │   ├── (AUTH)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── analytics/index.tsx
│   │   │   │   │   ├── contacts/index.tsx
│   │   │   │   │   ├── files/index.tsx
│   │   │   │   │   ├── inbox/index.tsx
│   │   │   │   │   ├── network/index.tsx
│   │   │   │   │   ├── overview/
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   └── welcome-modal.tsx
│   │   │   │   │   ├── payments/
│   │   │   │   │   │   ├── checkout-modal.tsx
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   ├── profile/index.tsx
│   │   │   │   │   ├── settings/index.tsx
│   │   │   │   │   └── sidebar/index.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── files/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/callback/route.ts
│   │   │   ├── contacts/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   ├── request/route.ts
│   │   │   │   ├── requests/
│   │   │   │   │   ├── [id]/route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── search/route.ts
│   │   │   ├── files/
│   │   │   │   ├── [fileId]/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── inbox/
│   │   │   │   ├── count/route.ts
│   │   │   │   └── files/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── [paymentId]/route.ts
│   │   │   │   ├── payfast/
│   │   │   │   │   ├── initiate/route.ts
│   │   │   │   │   └── notify/route.ts
│   │   │   │   ├── received/route.ts
│   │   │   │   └── request/route.ts
│   │   │   ├── profile/route.ts
│   │   │   ├── public/upload/route.ts
│   │   │   └── qr/generate/route.ts
│   │   ├── payments/[id]/
│   │   │   ├── page.tsx
│   │   │   └── payment-form.tsx
│   │   ├── q/[username]/
│   │   │   ├── file-upload-section.tsx
│   │   │   ├── page.tsx
│   │   │   ├── save-contact-button.tsx
│   │   │   └── socials-dropdown.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── files/FileUploadSection.tsx
│   │   ├── landing/page.tsx
│   │   ├── payments/PaySection.tsx
│   │   ├── profile/ContactSection.tsx
│   │   ├── qr/QRCard.tsx
│   │   ├── ui/toast.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── email/resend.ts
│   │   ├── files/
│   │   │   ├── storage.ts
│   │   │   └── storageService.ts
│   │   ├── payfast/initiate.ts
│   │   ├── qr/generate.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── avatar.ts
│   │   └── utils.ts
│   └── types/index.ts
├── supabase/migrations/
│   ├── 001_initial.sql
│   ├── 002_contacts.sql
│   ├── 003_contact_requests.sql
│   ├── 004_files_received.sql
│   └── 005_avatar.sql
├── AGENTS.md / CLAUDE.md / Build.md / README.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── proxy.ts
└── tsconfig.json