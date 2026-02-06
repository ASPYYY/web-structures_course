from django.shortcuts import render
from .models import Asset

def home (request):
    assets = Asset.objects.all().order_by('-created_at')
    # 1. Готовим данные (Context). Это словарь Python.
    # Ключи словаря станут именами переменных в HTML.
    context_data = {
    'page_title_home': 'Главная Галерея',
    'models_count': len(assets), # Попробуйте поменять на 5, чтобы проверить условие
    'assets': assets,
    }

    # 2. Рендерим (смешиваем HTML и данные)
    # Путь указываем относительно папки templates: 'gallery/index.html'
    return render(request, 'gallery/index.html', context_data)

