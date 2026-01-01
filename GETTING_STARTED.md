# Getting Started with DocManager

## Quick Start (Easiest Way)

### For Linux/Mac:
```bash
./quickstart.sh
```

### For Windows:
```batch
quickstart.bat
```

Then follow the on-screen instructions!

## Manual Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 20 or higher
- npm or yarn

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
python manage.py migrate
```

5. (Optional) Create a superuser for Django admin:
```bash
python manage.py createsuperuser
```

6. Start the Django server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Step 2: Frontend Setup

1. Open a NEW terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Verify Installation

1. Open your browser to `http://localhost:5173/`
2. You should see the DocManager navigation with two links:
   - docManager
   - docValidator

## Adding Templates

1. Create a Word document (.docx) with Jinja2 metadata
2. Place it in the `backend/data/` directory
3. Refresh the docManager page to see your template

### Example Template Metadata

Add this to your Word document (it will be hidden in the rendered doc):

```
{% set _ = meta([
    {"name": "My Template"},
    {"version": "1.0"},
    {"creator": "Your Name"},
    {"category": ["Reports"]},
    {"provider": ["Company Name"]},
    {"tags": ["report", "monthly"]}
]) %}

{% set _ = options([
    {"name": "title", "type": "string"},
    {"name": "date", "type": "date", "offset": 0},
    {"name": "amount", "type": "number"}
]) %}

{% set _ = layout([
    {
        "Header": [
            ["title"],
            ["date"]
        ]
    },
    {
        "Content": [
            ["amount"]
        ]
    }
]) %}
```

Then use placeholders in your document like:
```
Title: {{ title }}
Date: {{ date }}
Amount: ${{ amount }}
```

## Common Commands

### Backend

```bash
# Run server
python manage.py runserver

# Run on different port
python manage.py runserver 8080

# Make migrations (after model changes)
python manage.py makemigrations
python manage.py migrate

# Access Django admin
# http://localhost:8000/admin/

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project URLs

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## API Endpoints

- `GET /api/templates/` - List all templates
- `POST /api/placeholders/` - Get placeholders for a template
  ```json
  {"filename": "template.docx"}
  ```
- `POST /api/generateDoc/` - Generate a document
  ```json
  {
    "filename": "template.docx",
    "context": {
      "title": "My Report",
      "date": "01.12.2024",
      "amount": "1000"
    }
  }
  ```
- `POST /api/validateDoc/` - Validate a document
  - Send as multipart/form-data with file field

## Troubleshooting

### Port Already in Use

**Backend (Django):**
```bash
# Use a different port
python manage.py runserver 8001
```

**Frontend (Vite):**
```bash
# Edit vite.config.ts and change the port
# Or kill the process using port 5173
```

### CORS Errors

If you see CORS errors in the browser console:

1. Check `backend/docmanager/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

2. Make sure `corsheaders` is in `INSTALLED_APPS`
3. Restart the Django server

### Module Not Found Errors

**Backend:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Errors

```bash
# Delete database and recreate
rm db.sqlite3
python manage.py migrate
```

## Next Steps

1. **Add your templates** to `backend/data/`
2. **Customize categories** by editing template metadata
3. **Add validation logic** in `backend/docmanager/api/views.py`
4. **Deploy to production** (see README.md)

## Getting Help

- Check `README.md` for detailed documentation
- See `MIGRATION_GUIDE.md` for FastAPI comparison
- Review example templates in the data directory

## Development Tips

1. **Auto-reload**: Both Django and Vite have hot-reload enabled
2. **Debug mode**: Django debug mode shows detailed error pages
3. **React DevTools**: Install React DevTools browser extension
4. **Django Debug Toolbar**: Can be added for API debugging

Enjoy using DocManager! 🚀
