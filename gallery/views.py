import base64
from django.core.files.base import ContentFile
from django.shortcuts import render, redirect
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Asset
from .forms import AssetForm
from django.core.paginator import Paginator
from django.contrib import messages

def home(request):
    search_query = request.GET.get('q', '')

    assets = Asset.objects.all()

    ordering = request.GET.get('ordering', 'new')

    if search_query:
        assets = assets.filter(title__icontains=search_query)

    if ordering == 'new':
        assets = assets.order_by('-created_at')
    elif ordering == 'old':
        assets = assets.order_by('created_at')
    elif ordering == 'name':
        assets = assets.order_by('title')


        # 3. ФИЛЬТР ПО ДАТЕ (новое!)
    days_filter = request.GET.get('days', '')
    if days_filter == '1':
        # За сегодня
        today = timezone.now().date()
        assets = assets.filter(created_at__date=today)
    elif days_filter == '7':
        # За последние 7 дней
        week_ago = timezone.now() - timedelta(days=7)
        assets = assets.filter(created_at__gte=week_ago)
    elif days_filter == '30':
        # За последние 30 дней
        month_ago = timezone.now() - timedelta(days=30)
        assets = assets.filter(created_at__gte=month_ago)

    paginator = Paginator(assets, 9)

    page_number = request.GET.get('page')

    page_obj = paginator.get_page(page_number)
    
    context_data = {
        'page_title_home': '3D Галерея',
        #'assets': assets,
        'page_obj': page_obj,
        'search_query': search_query,
        'current_ordering': ordering,
        'current_days': days_filter,  # для подсветки активного фильтра
    }

    
    
    # assets = Asset.objects.all().order_by('-created_at')
    # 1. Готовим данные (Context). Это словарь Python.
    # Ключи словаря станут именами переменных в HTML.
    
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

            messages.success(request, f'Модель "{ new_asset.title }" успешно загружена!')
            
            return redirect('home')
        else:
            # Если форма не валидна, показываем ошибки
            return render(request, 'gallery/upload.html', {'form': form})
    else:
        form = AssetForm()
        return render(request, 'gallery/upload.html', {'form': form})