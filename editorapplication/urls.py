from django.urls import path

from editorapplication.dataaccess.dbaccess import data
from editorapplication.views import showPage, get_data

urlpatterns = [
    path('', data),
    path('data', showPage),
    path('get_data', get_data)
]