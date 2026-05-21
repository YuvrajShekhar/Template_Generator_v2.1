# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack document management system. The Django backend exposes a REST API that extracts Jinja2 metadata from `.docx` templates, generates filled documents via `docxtpl`, and handles email dispatch history. The React/TypeScript frontend presents dynamic forms driven by that metadata.

---

## Development Commands

### Backend
```bash
cd backend
source venv/bin/activate          # activate virtual env
python manage.py runserver        # http://localhost:8000
python manage.py migrate
python manage.py createsuperuser
```

### Frontend
```bash
cd docmanager-frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api/* to :8000)
npm run build      # outputs to dist/
npm run lint
```

---

## Architecture

### Backend (`backend/`)

**No custom Django models.** Uses only Django's built-in `User` model. All data lives in `.docx` files in `backend/data/`.

**Core flow:**
1. `DocManager` class (`docmanager/core/doc_manager.py`) — all template business logic:
   - Parses Jinja2 blocks from `.docx` files to extract `meta()`, `options()`, and `layout()` declarations
   - Renders templates with user-supplied context using `docxtpl`
   - Loads provider addresses from `provider_addresses.xlsx`; the `PROVIDER_ADDR` placeholder is auto-populated
2. Function-based DRF views (`docmanager/api/views.py`) wrap `DocManager` and expose REST endpoints
3. JWT auth via `rest_framework_simplejwt` — 60 min access / 7 day refresh; all `/api/` routes require authentication except `/api/auth/login/`

**Key API endpoints** (all under `/api/`):
| Method | Path | Purpose |
|--------|------|---------|
| POST | `auth/login/` | Obtain JWT tokens |
| GET | `templates/` | List available `.docx` files with metadata |
| POST | `placeholders/` | Return form field definitions for a template |
| POST | `generateDoc/` | Render and download a filled `.docx` |
| POST | `validateDoc/` | Validate an uploaded `.docx` |
| GET | `dispatch/` | Email dispatch history from `data/mails_sent.csv` |

**Error hierarchy:** `DocError → TemplateNotFound | InvalidContext | RenderError`

### Frontend (`docmanager-frontend/src/`)

**Feature-based module structure.** Each feature is self-contained with its own components, services, hooks, and types.

```
src/
  features/
    auth/              # AuthContext, login page, JWT token management
    document-generator/  # Template list → dynamic form → download
    document-validator/  # Upload and validate .docx
    email-dispatch/      # Dispatch history table
  shared/
    api/               # Fetch client with retry/backoff, error mapping
    hooks/             # Shared hooks
    constants/         # App-wide constants
  app/
    routes/AppRouter.tsx   # Route definitions (lazy-loaded pages)
    layout/            # MainLayout, Header, Sidebar
```

**Key patterns:**
- **TanStack Query** — server state; 5 min stale time, auto-retry
- **React Hook Form + Zod** — dynamic forms from template `options()` metadata
- **AuthContext** — session management; tokens in `localStorage`; silent refresh
- **Vite proxy** — `/api/*` proxied to `http://localhost:8000` in dev

---

## Template Metadata Format

Word templates use Jinja2 blocks to declare structure. These three blocks drive the entire frontend form:

```jinja
{% set _ = meta(["name=My Template", "version=1.0", "category=Contracts", "provider=Telco", "tags=mobile,dsl"]) %}
{% set _ = options(["field_name|Label|type|required", ...]) %}
{% set _ = layout([["group_title", "field1", "field2"], ...]) %}
```

- **`options` types:** `string`, `number`, `date`, `enum:val1:val2:val3`
- **`{{ PROVIDER_ADDR }}`** is auto-filled from `provider_addresses.xlsx` — do not expose it as a user field
- Regular template variables use standard `{{ variable_name }}` syntax

---

## Key Configuration

- **Database:** SQLite (`backend/db.sqlite3`) — no migrations needed for custom models
- **CORS:** configured for `localhost:5173` + production domains in `docmanager/settings.py`
- **Static files:** collected to `backend/staticfiles/` for production (`gunicorn docmanager.wsgi:application`)
- **Python:** 3.8.10+ compatible (Django 4.2 LTS)
