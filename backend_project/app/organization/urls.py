# organization/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet ,PersonAddInParent

router = DefaultRouter()
router.register(r'persons', PersonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('persons-add-in-parent/', PersonAddInParent.as_view(), name='person-add'),
]
