import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Asset

@receiver(post_delete, sender=Asset)
def remove_files_on_delete(sender, instance, **kwargs):
    """
    Автоматически удаляет файлы с диска при удалении записи из базы данных
    """
    # Удаляем 3D файл
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)
            print(f"✅ Файл {instance.file.name} удален с диска.")
    
    # Удаляем превью
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
            print(f"✅ Превью {instance.image.name} удалено с диска.")