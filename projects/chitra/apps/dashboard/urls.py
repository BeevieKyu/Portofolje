from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.home, name='home'),

    path('henvendelser/', views.henvendelse_list, name='henvendelse_list'),
    path('henvendelser/<int:pk>/', views.henvendelse_detail, name='henvendelse_detail'),
    path('henvendelser/<int:pk>/slett/', views.henvendelse_delete, name='henvendelse_delete'),

    path('innstillinger/', views.innstillinger, name='innstillinger'),
]
