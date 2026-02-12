from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Asset
from .forms import AssetForm

def home(request):
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

def upload(request):
    if request.method == 'POST':
        # Сценарий: Пользователь нажал "Отправить"
        # ВАЖНО: Передаем request.FILES, иначе файл потеряется!
        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
        # Если все поля заполнены верно - сохраняем в БД
            form.save()
        # И перекидываем пользователя на главную
            return redirect('home')
    
    else:
        # Сценарий: Пользователь просто зашел на страницу (GET)
        form = AssetForm() # Создаем пустую форму

##    context_data = {
##        'page_title_upload' : 'Загрузка моделей'
##    }

    return render(request, 'gallery/upload.html', {'form': form})
