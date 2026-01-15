from django.urls import path
from . import views
from . import auth_views

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', auth_views.login, name='auth-login'),
    path('auth/logout/', auth_views.logout, name='auth-logout'),
    path('auth/refresh/', auth_views.refresh_token, name='auth-refresh'),
    path('auth/me/', auth_views.me, name='auth-me'),
    
    # Existing endpoints (now protected by default)
    path('templates/', views.templates_list, name='templates-list'),
    path('placeholders/', views.placeholders, name='placeholders'),
    path('generateDoc/', views.generate_doc, name='generate-doc'),
    path('validateDoc/', views.validate_doc, name='validate-doc'),
]