from django.shortcuts import render
from django.http import HttpResponse

def home (request):
    fake_database = [
    {'id': 1, 'name': 'Sci-Fi Helmet', 'file_size': '15 MB'},
    {'id': 2, 'name': 'Old Chair', 'file_size': '2 MB'},
    {'id': 3, 'name': 'Cyber Truck', 'file_size': '10 MB'},
    {'id': 4, 'name': 'Air Plane', 'file_size': '30 MB'},
    ]
    
    # 1. Готовим данные (Context). Это словарь Python.
    # Ключи словаря станут именами переменных в HTML.
    context_data = {
    'page_title': 'Главная Галерея',
    'models_count': len(fake_database), # Попробуйте поменять на 5, чтобы проверить условие
    'assets': fake_database,
    }

    # 2. Рендерим (смешиваем HTML и данные)
    # Путь указываем относительно папки templates: 'gallery/index.html'
    return render(request, 'gallery/index.html', context_data)