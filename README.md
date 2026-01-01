# DocManager - Django + React

A document management system built with Django REST Framework and React + TypeScript.

## ✨ Python 3.8.10 Compatible

This project is **specifically configured for Python 3.8.10** and uses Django 4.2 LTS for maximum compatibility.

## Features

- **Document Template Management**: List and manage Word document templates
- **Dynamic Form Generation**: Automatically generate forms based on template placeholders
- **Document Generation**: Fill templates with user data and download
- **Document Validation**: Upload and validate documents
- **Filtering & Search**: Filter templates by category, provider, and tags

## Project Structure

```
django_react_docmanager/
├── backend/              # Django REST API
│   ├── docmanager/
│   │   ├── api/         # REST API views and URLs
│   │   ├── core/        # Core business logic (DocManager)
│   │   ├── settings.py
│   │   └── urls.py
│   ├── data/            # Document templates directory
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/            # React + TypeScript app
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── services/    # API service layer
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites

- **Python 3.8.10 or higher** (tested with 3.8.10)
- Node.js 20+
- npm or yarn

> **Note:** This project uses Django 4.2 LTS which supports Python 3.8+. For Python 3.10+ compatibility, see `PYTHON38_COMPATIBILITY.md`.

### Backend Setup (Django)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Start the Django development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup (React)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/`

## API Endpoints

- `GET /api/templates/` - List all templates
- `POST /api/placeholders/` - Get placeholders for a template
- `POST /api/generateDoc/` - Generate a document
- `POST /api/validateDoc/` - Validate a document

## Template Format

Templates should be Word (.docx) files with Jinja2 syntax for metadata:

```
{% set _ = meta([
    {"name": "Invoice Template"},
    {"version": "1.0"},
    {"creator": "John Doe"},
    {"category": ["Invoices", "Finance"]},
    {"provider": ["Company A"]},
    {"tags": ["invoice", "billing"]}
]) %}

{% set _ = options([
    {"name": "customer_name", "type": "string"},
    {"name": "invoice_date", "type": "date", "offset": 0},
    {"name": "amount", "type": "number"}
]) %}

{% set _ = layout([
    {
        "Customer Details": [
            ["customer_name"],
            ["customer_address"]
        ]
    },
    {
        "Invoice Details": [
            ["invoice_date", "invoice_number"],
            ["amount"]
        ]
    }
]) %}
```

## Development

### Backend

- API views are in `backend/docmanager/api/views.py`
- Core logic is in `backend/docmanager/core/doc_manager.py`
- Add new endpoints in `backend/docmanager/api/urls.py`

### Frontend

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API service is in `frontend/src/services/doc_manager_service.tsx`

## Building for Production

### Backend

```bash
cd backend
python manage.py collectstatic
# Use gunicorn or similar WSGI server
gunicorn docmanager.wsgi:application
```

### Frontend

```bash
cd frontend
npm run build
# Deploy the dist/ folder to a static file server
```

## Technologies Used

### Backend
- **Python 3.8.10+**
- **Django 4.2 LTS** (Python 3.8 compatible)
- Django REST Framework 3.14
- python-docx-template
- django-cors-headers

### Frontend
- React 19
- TypeScript
- Vite
- React Router

## License

MIT
