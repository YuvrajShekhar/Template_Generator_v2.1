# DocManager Frontend

A modern React frontend for the Document Automation System, built with TypeScript, Tailwind CSS, and TanStack Query.

## 🚀 Features

- **Document Generator**: Select templates and generate documents with dynamic forms
- **Document Validator**: Upload and validate .docx templates
- **Modern UI**: Clean, responsive design with dark mode support
- **Type-Safe**: Full TypeScript support throughout

## 📋 Prerequisites

- **Node.js** 20.19.0 or higher
- **npm** 8.0.0 or higher
- **Python** 3.8+ (for the backend)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd docmanager-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different port:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🏃 Running the Application

### Development Mode

Start the frontend development server:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### With Backend (Full Stack)

If you have the backend in the same project:

```bash
npm run dev:all
```

This starts both the frontend (port 5173) and backend (port 8000).

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── app/                    # Application shell
│   ├── layout/            # Layout components (Sidebar, Header, MainLayout)
│   └── routes/            # Route configuration
│
├── features/              # Feature modules
│   ├── document-generator/
│   │   ├── components/    # Generator-specific components
│   │   ├── hooks/         # Data fetching hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   │
│   └── document-validator/
│       ├── components/    # Validator-specific components
│       ├── hooks/         # Data fetching hooks
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── types/         # TypeScript types
│
├── shared/                # Shared code
│   ├── components/
│   │   ├── ui/           # Base UI components (Button, Card, Input, etc.)
│   │   ├── feedback/     # Loading, Error, Empty states
│   │   └── icons/        # Icon components
│   ├── hooks/            # Shared hooks
│   ├── utils/            # Utility functions
│   └── constants/        # Constants and config
│
├── styles/               # Global styles
│   └── globals.css       # Tailwind + custom CSS
│
└── main.tsx              # Application entry point
```

## 🧩 Key Technologies

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vite](https://vitejs.dev/) | Build Tool |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [TanStack Query](https://tanstack.com/query) | Server State |
| [React Router](https://reactrouter.com/) | Routing |
| [React Hook Form](https://react-hook-form.com/) | Form Handling |
| [Zod](https://zod.dev/) | Schema Validation |
| [Radix UI](https://www.radix-ui.com/) | Accessible Components |
| [Lucide React](https://lucide.dev/) | Icons |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:all` | Start frontend + backend |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Component Usage

### Button

```tsx
import { Button } from "@shared/components/ui";

<Button variant="default">Click me</Button>
<Button variant="outline" isLoading>Loading...</Button>
<Button leftIcon={<Icon />}>With Icon</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@shared/components/ui";

<Card hoverable>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Form Components

```tsx
import { Input, Label, Select, SelectItem } from "@shared/components/ui";

<div>
  <Label htmlFor="name" required>Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>
```

## 🔧 Path Aliases

The project uses path aliases for cleaner imports:

```typescript
import { Button } from "@shared/components/ui";
import { MainLayout } from "@app/layout";
import { useTemplates } from "@features/document-generator/hooks";
```

| Alias | Path |
|-------|------|
| `@/*` | `./src/*` |
| `@app/*` | `./src/app/*` |
| `@features/*` | `./src/features/*` |
| `@shared/*` | `./src/shared/*` |
| `@styles/*` | `./src/styles/*` |

## 🌙 Dark Mode

Dark mode is supported out of the box. Toggle it using the button in the header.

## 📈 Development Roadmap

- [x] **Phase 1**: Foundation & Architecture
  - [x] Project structure
  - [x] Tailwind CSS setup
  - [x] UI components library
  - [x] Layout components
  - [x] Routing setup

- [x] **Phase 2**: Core Features
  - [x] Template listing & filtering (TemplateCard, TemplateGrid, TemplateFilters)
  - [x] Dynamic form generation (FormField, DynamicForm)
  - [x] Document generation flow (useDocumentGeneration, usePlaceholders)
  - [x] Drag & drop file upload (DropZone)
  - [x] Validation results display (ValidationResults)
  - [x] API integration with TanStack Query

- [x] **Phase 3**: Enhancement & Polish
  - [x] Form validation with Zod schemas
  - [x] Enhanced error handling with retry logic (ApiError, NetworkError, TimeoutError)
  - [x] Recent templates history (localStorage persistence)
  - [x] Keyboard navigation & accessibility (useKeyboardNavigation, useFocusTrap)
  - [x] Skip link for screen readers
  - [x] Toast notification system
  - [x] ARIA roles and labels

- [ ] **Phase 4**: Advanced Features
  - [ ] Template preview
  - [ ] Batch document generation
  - [ ] Export validation reports

## 📄 License

Private - All rights reserved

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
