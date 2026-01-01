from django.urls import path
from . import views

urlpatterns = [
    path('templates/', views.templates_list, name='templates-list'),
    path('placeholders/', views.placeholders, name='placeholders'),
    path('generateDoc/', views.generate_doc, name='generate-doc'),
    path('validateDoc/', views.validate_doc, name='validate-doc'),
]
