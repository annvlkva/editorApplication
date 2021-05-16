from django.shortcuts import render

# Create your views here.
from editorapplication.dataaccess.dbaccess import data

def showPage(request):
    return render(request, 'editor.html')

def showTable(request):
    return render(request, 'table.html')

def get_data(request):
    response = data(request)
    return response
