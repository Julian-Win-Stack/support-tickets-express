# Where to Put Your Code

## Folder structure

```
frontend/
├── app/                    # Routes (pages)
│   ├── layout.tsx          # Root layout (keep)
│   ├── page.tsx            # Home page (/)
│   ├── globals.css         # Global styles (add your CSS here or import)
│   ├── login/
│   │   └── page.tsx        # /login
│   ├── register/
│   │   └── page.tsx        # /register
│   ├── dashboard/
│   │   └── page.tsx        # /dashboard (protected)
│   └── tickets/
│       └── [id]/
│           └── page.tsx    # /tickets/123 (protected)
│
├── components/             # Reusable UI components
│   ├── Header.tsx
│   ├── TicketCard.tsx
│   ├── TicketForm.tsx
│   └── ...
│
├── lib/                    # API client, utilities
│   ├── api.ts              # fetch wrappers (login, me, listTickets, etc.)
│   └── ...
│
├── contexts/               # React context (auth state, etc.)
│   └── AuthContext.tsx
│
└── public/                 # Static assets (images, favicon)
```

## Quick reference

| What | Where |
|------|-------|
| Pages / routes | `app/<route>/page.tsx` |
| Shared layout | `app/layout.tsx` or `app/<route>/layout.tsx` |
| Reusable UI | `components/` |
| API calls to Express | `lib/api.ts` |
| Auth state | `contexts/AuthContext.tsx` |
| Global CSS | `app/globals.css` |
| Per-page CSS | Create `page.module.css` next to the page |
| Images, favicon | `public/` |
