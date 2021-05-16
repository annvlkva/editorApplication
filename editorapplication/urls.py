from django.urls import path

from editorapplication.dataaccess.dbaccess import data
from editorapplication.views import showPage, get_data, showTable

urlpatterns = [
    path('', data),
    path('data', showPage),
    path('get_data', get_data),
    path('table', showTable),
]