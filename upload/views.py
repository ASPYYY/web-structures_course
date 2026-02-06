from django.shortcuts import render


def upload (request):
    context_data = {
        'page_title_home': 'Загрузка моделей'
    }
    return render(request, 'gallery/upload.html', context_data)