from django.shortcuts import render
from editorapplication.dataaccess.dbaccess import data

def showPage(request):
    return render(request, 'editor.html')

def get_data(request):
    response = data(request)
    return response
