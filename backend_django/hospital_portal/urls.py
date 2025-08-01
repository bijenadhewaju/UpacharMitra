# backend_django/hospital_portal/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # This is the only line you need to connect your API
    path('api/', include('hospital.urls')),
]

# This line is needed to make your uploaded images work
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)