import base64
from django.core.files.base import ContentFile
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
        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
            # 1. Создаем объект, но пока НЕ сохраняем в базу (commit=False)
            new_asset = form.save(commit=False)
            
            # 2. Обрабатываем картинку из скрытого поля
            image_data = request.POST.get('image_data') # Получаем строку Base64
            
            if image_data:
                # Формат строки: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
                # Нам нужно отрезать заголовок "data:image/jpeg;base64,"
                try:
                    format, imgstr = image_data.split(';base64,')
                    ext = format.split('/')[-1] # получаем "jpeg"
                    
                    # Декодируем текст в байты
                    data = base64.b64decode(imgstr)
                    
                    # Создаем имя файла (берем имя модели + .jpg)
                    file_name = f"{new_asset.title}_thumb.{ext}"
                    
                    # Сохраняем байты в поле image
                    # ContentFile превращает байты в объект, который понимает Django FileField
                    new_asset.image.save(file_name, ContentFile(data), save=False)
                except Exception as e:
                    print(f"Ошибка при обработке изображения: {e}")
            
            # 3. Финальное сохранение в БД
            new_asset.save()
            
            return redirect('home')
        else:
            # Если форма не валидна, показываем ошибки
            return render(request, 'gallery/upload.html', {'form': form})
    else:
        form = AssetForm()
        return render(request, 'gallery/upload.html', {'form': form})