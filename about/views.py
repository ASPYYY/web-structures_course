from django.shortcuts import render
from django.http import HttpResponse

def about(request):
    context_data = {
        'page_title_about': 'О нас'
    }
    return render(request, 'gallery/about.html', context_data)