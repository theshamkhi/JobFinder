# 🔍 JobFinder

> Single Page Application for searching, saving, and tracking job applications — built with Angular 21, NgRx, and Tailwind CSS.

![Angular](https://img.shields.io/badge/Angular-21.1.3-DD0031?style=flat-square&logo=angular)
![NgRx](https://img.shields.io/badge/NgRx-18-764ABC?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![JSON Server](https://img.shields.io/badge/JSON_Server-0.17-gray?style=flat-square)

---

## 🧭 Overview

JobFinder aggregates job listings from **The Muse** (global) and **Arbeitnow** (Europe + Remote) into a unified dark-themed interface. Users can search by keyword and location, save favorites, and track the status of their applications — all without a custom backend, using **JSON Server** as a mock REST API.

---

## ✅ Features

### Public (no login required)
- 🔍 Search jobs by **keyword** (title only — per spec) and **location**
- 🌍 Results merged from The Muse + Arbeitnow, sorted by **newest first**
- 🏠 **Remote only** filter toggle
- ✅ **Per-source** toggle (enable/disable The Muse or Arbeitnow independently)
- 📄 **Paginated results** — 10 per page, client-side
- ⏳ Loading spinner during API calls

### Authenticated users only
- ❤️ **Save favorites** — persisted in JSON Server, synced via NgRx store
- 🔴 **Badge count** on navbar Favorites link (live from NgRx)
- 📋 **Track applications** — add with one click from any job card
- 🔄 **Update application status** — Pending / Accepted / Rejected
- 📝 **Personal notes** per application — auto-saved on blur
- 🗑️ Delete favorites and applications
- 👤 Edit profile (name, email, password)
- ❌ Delete account

### UX details
- 🌑 Full dark theme (`bg-surface-950`) with Tailwind custom tokens
- 🔔 Toast notifications for all actions (success, error, info)
- 📱 Fully responsive — mobile menu + desktop layout
- 🕐 Relative date display (`2h ago`, `3d ago`) via custom pipe
- 🎨 Company avatar auto-generated from gradient by name initial

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Installation

```bash
git clone https://github.com/theshamkhi/JobFinder.git
cd JobFinder
npm install
```

### Run the app

```bash
# Terminal 1 — mock backend
json-server --watch db.json --port 3000

# Terminal 2 — Angular dev server
npm start
```

Then open **http://localhost:4200**

### Demo account

| Field    | Value                  |
|----------|------------------------|
| Email    | demo@jobfinder.com     |
| Password | Demo1234!              |

> The demo account is pre-seeded in `db.json`. Register a new account anytime from the UI.

---

## 🏗️ Project Structure

```
jobfinder/
├── db.json                          # JSON Server database (users, favorites, applications)
├── tailwind.config.js               # Custom dark theme colors, fonts, animations
├── src/
│   ├── environments/
│   │   └── environment.ts           # Dev config — API base URLs
│   ├── styles.css                   # Tailwind directives + global component classes
│   └── app/
│       ├── app.ts                   # Root component — bootstraps favorites on login
│       ├── app.html                 # Dark layout shell with navbar, router-outlet, footer
│       ├── app.config.ts            # provideStore, provideEffects, provideHttpClient
│       ├── app.routes.ts            # All routes with lazy loading + guards
│       │
│       ├── core/
│       │   ├── guards/
│       │   │   └── auth.guard.ts    # authGuard (protected) + guestGuard (login/register)
│       │   ├── interceptors/
│       │   │   └── error.interceptor.ts   # Centralized HTTP error → toast
│       │   └── services/
│       │       ├── auth.service.ts        # Signal-based auth, localStorage session
│       │       ├── job.service.ts         # Aggregates The Muse + Arbeitnow
│       │       ├── favorites.service.ts   # JSON Server CRUD for favoritesOffers
│       │       ├── applications.service.ts # JSON Server CRUD for applications
│       │       └── notification.service.ts # Signal-based toast queue
│       │
│       ├── store/
│       │   └── favorites/
│       │       ├── favorites.actions.ts   # createActionGroup
│       │       ├── favorites.reducer.ts   # createReducer
│       │       ├── favorites.effects.ts   # createEffect (load, add, remove)
│       │       └── favorites.selectors.ts # selectAllFavorites, selectIsFavorite(id)
│       │
│       ├── shared/
│       │   ├── models/
│       │   │   ├── job.model.ts           # NormalizedJob, TheMuseJob, ArbeitnowJob, etc.
│       │   │   ├── user.model.ts          # User, UserSession, LoginPayload
│       │   │   ├── application.model.ts   # Application, ApplicationStatus
│       │   │   └── favorite.model.ts      # FavoriteOffer
│       │   ├── pipes/
│       │   │   └── relative-date.pipe.ts  # "2h ago", "3d ago", "just now"
│       │   └── components/
│       │       ├── navbar/                # Dark sticky navbar with dropdown + mobile menu
│       │       ├── job-card/              # Card with Save ❤️ and Track 📋 buttons
│       │       ├── loading-spinner/       # Dual-ring CSS spinner
│       │       ├── pagination/            # Ellipsis pagination with page-change output
│       │       └── toast/                 # Fixed bottom-right toast queue
│       │
│       └── features/
│           ├── home/                      # Landing page with hero + feature grid
│           ├── auth/
│           │   ├── login/                 # Reactive form, password toggle, demo hint
│           │   └── register/              # Reactive form, password match validator
│           ├── jobs/
│           │   ├── job-list/              # Search page — merges both APIs
│           │   └── job-filters/           # Sidebar — remote toggle + source checkboxes
│           ├── favorites/                 # NgRx-connected favorites grid
│           ├── applications/              # Tracker with status select + notes
│           └── profile/                  # Edit info, change password, delete account
```

---

## 🔌 APIs

### The Muse
| Property | Value |
|----------|-------|
| Base URL | `https://www.themuse.com/api/public` |
| Auth | Optional API key (`api_key` query param) |
| Rate limit | 500 req/h (no key) · 3600 req/h (with key) |
| Coverage | Global |
| Pagination | 0-indexed `page` param |
| Keyword search | ❌ None — filtered client-side on `name` field |

### Arbeitnow
| Property | Value |
|----------|-------|
| Base URL | `https://www.arbeitnow.com/api/job-board-api` |
| Auth | None required |
| Rate limit | Not documented (free) |
| Coverage | Europe + Remote |
| Pagination | `page` param (1-indexed) |
| Keyword search | ❌ None — filtered client-side on `title` field |

> **Business rule enforced:** keyword search matches only the job **title**. Jobs that contain the keyword only in the description are excluded.

### Normalised job model

Both APIs are mapped to a single `NormalizedJob` interface:

```ts
interface NormalizedJob {
  id: string;           // "themuse_123" | "arbeitnow_some-slug"
  title: string;
  company: string;
  location: string;
  description: string;  // HTML stripped, truncated to 300 chars
  url: string;
  publicationDate: string; // ISO 8601
  tags?: string[];
  remote?: boolean;
  level?: string;
  category?: string;
  apiSource: 'themuse' | 'arbeitnow';
}
```

---

## 🔐 Authentication Flow

There is no real backend. Authentication is simulated using JSON Server:

```
1. Register   → POST /users (checks email uniqueness first)
2. Login      → GET /users?email=X → compare password in-memory
3. Session    → { id, firstName, lastName, email } stored in localStorage
4. Guards     → authGuard reads AuthService.isAuthenticated() signal
5. Logout     → clears localStorage + dispatches clearFavorites action
```

> ⚠️ Passwords are stored in plain text in `db.json`. This is intentional — the project spec calls for a fake auth mechanism. Never use this pattern in production.

---

## 🗃️ NgRx Store

Only **favorites** are managed in the global store. The store shape:

```ts
interface AppState {
  favorites: {
    favorites: FavoriteOffer[];
    loading: boolean;
    error: string | null;
  }
}
```

### Action flow

```
User clicks ❤️
  → dispatch addFavorite({ favorite })
    → FavoritesEffects.addFavorite$
      → FavoritesService.addFavorite() → POST /favoritesOffers
        → dispatch addFavoriteSuccess({ favorite })
          → favoritesReducer appends to state.favorites[]
            → selectFavoritesCount updates navbar badge
            → selectIsFavorite(id) updates job card button
```

### Selectors

| Selector | Used in |
|----------|---------|
| `selectAllFavorites` | Favorites page |
| `selectFavoritesCount` | Navbar badge |
| `selectFavoritesLoading` | Favorites page spinner |
| `selectIsFavorite(offerId)` | JobCard button state |
| `selectFavoriteByOfferId(offerId)` | JobCard (to get id for removal) |

> Install the **Redux DevTools** browser extension to inspect dispatched actions and state snapshots in real time.

---

## 🗄️ JSON Server Schema

Runs on `http://localhost:3000`. Three collections in `db.json`:

```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Demo",
      "lastName": "User",
      "email": "demo@jobfinder.com",
      "password": "Demo1234!"
    }
  ],
  "favoritesOffers": [
    {
      "id": 1,
      "userId": 1,
      "offerId": "themuse_123",
      "title": "Frontend Developer",
      "company": "Acme Corp",
      "location": "Paris, France",
      "url": "https://...",
      "apiSource": "themuse",
      "dateAdded": "2026-02-10T10:00:00Z"
    }
  ],
  "applications": [
    {
      "id": 1,
      "userId": 1,
      "offerId": "arbeitnow_some-slug",
      "apiSource": "arbeitnow",
      "title": "Angular Developer",
      "company": "Tech GmbH",
      "location": "Berlin, Germany",
      "url": "https://...",
      "status": "en_attente",
      "notes": "Applied via LinkedIn",
      "dateAdded": "2026-02-10T10:30:00Z"
    }
  ]
}
```
---

## 🎓 Angular Concepts Used

| Concept | Where |
|---------|-------|
| **Standalone components** | Every component — no NgModules |
| **Signals** (`signal`, `computed`) | AuthService state, all component local state |
| **`inject()`** | All dependency injection — no constructor params |
| **Lazy loading** | Every feature route via `loadComponent` |
| **`CanActivateFn` guards** | `authGuard`, `guestGuard` in `app.routes.ts` |
| **`HttpInterceptorFn`** | `error.interceptor.ts` — centralized error toasts |
| **Reactive Forms** | Login, Register, Profile — with custom validators |
| **Custom validator** | `passwordMatchValidator` in Register |
| **`@if` / `@for`** | All templates — Angular 17+ control flow (no `*ngIf`/`*ngFor`) |
| **`@Input` / `@Output`** | JobCard ↔ parent, Pagination ↔ parent, JobFilters ↔ Jobs |
| **Parent/child components** | JobsComponent → JobFiltersComponent + JobCardComponent |
| **Custom Pipe** | `RelativeDatePipe` — `2h ago`, `yesterday`, etc. |
| **`combineLatest`** | Parallel API calls in `JobService.searchJobs()` |
| **`switchMap` / `mergeMap`** | NgRx effects for load/add/remove |
| **`catchError`** | Every API call — returns `of([])` on failure |
| **`createActionGroup`** | Favorites actions — typed group with source prefix |
| **`createReducer` + `on()`** | Favorites reducer — immutable state updates |
| **`createEffect`** | Three effects: load, add, remove favorites |
| **`createSelector`** | Five selectors for favorites, memoized |
| **`selectSignal()`** | Navbar badge count from NgRx store as Angular signal |
| **`@HostListener`** | Navbar click-outside to close dropdown |

---

## 👤 Author

Developed as part of the **Soutenance croisée 2 — 2025/2026** project brief  
YouCode · Simplon Maghreb
