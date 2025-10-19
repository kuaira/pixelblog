from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import PostViewSet, LoginView, MeView, RegisterView

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
] + router.urls