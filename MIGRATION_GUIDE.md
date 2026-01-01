# Migration Guide: FastAPI to Django REST Framework

## Overview

This document explains the migration from the original FastAPI + React application to Django REST Framework + React.

## Key Changes

### Backend Architecture

#### Before (FastAPI)
```
backend/
├── server.py                 # FastAPI app
├── doc_manager.py           # Core logic
└── validator/
    └── validator.py         # Validation logic
```

#### After (Django)
```
backend/
├── docmanager/              # Django project
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL config
│   ├── wsgi.py              # WSGI entry point
│   ├── api/                 # REST API app
│   │   ├── views.py         # API views (was server.py)
│   │   └── urls.py          # API URLs
│   └── core/                # Core business logic
│       └── doc_manager.py   # DocManager class
├── data/                    # Templates directory
└── manage.py                # Django management script
```

### API Endpoints Mapping

| FastAPI Endpoint | Django Endpoint | Method |
|-----------------|-----------------|--------|
| `/templates` | `/api/templates/` | GET |
| `/placeholders` | `/api/placeholders/` | POST |
| `/generateDoc` | `/api/generateDoc/` | POST |
| `/validateDoc` | `/api/validateDoc/` | POST |

### Frontend Changes

The frontend remains largely the same with only one major change:

**API Base URL Update**
```typescript
// Before (FastAPI)
base = "http://localhost:8000"

// After (Django)
base = "http://localhost:8000/api"
```

All React components and logic remain identical.

## Migration Benefits

### 1. **Better Structure**
Django provides a more organized project structure with clear separation of concerns:
- Settings management
- URL routing
- Middleware support
- Admin interface

### 2. **Built-in Admin Interface**
Django comes with a powerful admin interface at `/admin/` for managing data.

### 3. **ORM & Database Support**
While not used in this project, Django's ORM is available for future database needs.

### 4. **Middleware & Authentication**
Easy to add authentication, permissions, and custom middleware.

### 5. **Production Ready**
Django is battle-tested with excellent deployment options:
- Gunicorn/uWSGI support
- Static file management
- Security features built-in

## Code Comparison

### Endpoint Definition

#### FastAPI
```python
@server.get("/templates")
def templates():
    return {"files": manager.list_templates()}
```

#### Django REST Framework
```python
@api_view(['GET'])
def templates_list(request):
    try:
        files = manager.list_templates()
        return Response({"files": files})
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

### CORS Configuration

#### FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

server.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Django
```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

## Running Both Versions

### FastAPI Version
```bash
cd backend
pip install fastapi uvicorn python-docx-template openpyxl
uvicorn server:server --reload --port 8000
```

### Django Version
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

## When to Use Each

### Use FastAPI When:
- Building microservices
- Need async/await support
- Want minimal overhead
- API-only application
- Need OpenAPI documentation out-of-the-box

### Use Django When:
- Building full web applications
- Need admin interface
- Want ORM and database management
- Need authentication/permissions
- Want a batteries-included framework
- Building a monolithic application

## Future Enhancements

With Django, you can easily add:

1. **User Authentication**
```python
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_doc(request):
    ...
```

2. **Database Models**
```python
from django.db import models

class Template(models.Model):
    filename = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    ...
```

3. **API Versioning**
```python
# urls.py
urlpatterns = [
    path('api/v1/', include('docmanager.api.v1.urls')),
    path('api/v2/', include('docmanager.api.v2.urls')),
]
```

4. **Celery for Background Tasks**
```python
from celery import shared_task

@shared_task
def generate_large_doc(filename, context):
    # Long-running document generation
    ...
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ALLOWED_ORIGINS` in `settings.py`
   - Ensure `corsheaders` is in `INSTALLED_APPS`
   - Middleware order matters

2. **Static Files Not Found**
   ```bash
   python manage.py collectstatic
   ```

3. **Module Import Errors**
   - Ensure virtual environment is activated
   - Check `INSTALLED_APPS` includes your app

4. **Database Errors**
   ```bash
   python manage.py migrate
   ```

## Conclusion

Both FastAPI and Django are excellent frameworks. This migration demonstrates that:
- The core business logic (DocManager) remains unchanged
- Frontend requires minimal changes
- Django provides more structure and built-in features
- The choice depends on your specific needs

For this document management system, Django offers better long-term maintainability and room for growth.
