import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Находим элементы DOM
const fileInput = document.querySelector('input[type="file"]');
const previewContainer = document.getElementById('preview-container');
const hiddenInput = document.getElementById('id_image_data');
const submitBtn = document.getElementById('submit-btn');

// Слушаем изменение файла
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Проверяем, что это .glb файл
            if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
                previewContainer.innerHTML = '<div style="color: red; padding: 20px;">❌ Пожалуйста, выберите .glb или .gltf файл</div>';
                return;
            }
            
            // Создаем временную ссылку на файл (Blob URL)
            const url = URL.createObjectURL(file);
            generateThumbnail(url);
        }
    });
}

function generateThumbnail(modelUrl) {
    previewContainer.innerHTML = '<div style="text-align: center; padding: 40px;">⏳ Генерация превью...</div>';
    
    // 1. Настройка сцены (Off-screen render)
    const width = 300;
    const height = 200;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Светло-серый фон
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // ВАЖНО: preserveDrawingBuffer: true нужен, чтобы сделать скриншот
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        preserveDrawingBuffer: true,
        alpha: false
    });
    
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Очищаем контейнер и добавляем канвас
    previewContainer.innerHTML = '';
    previewContainer.appendChild(renderer.domElement);
    
    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-5, 0, -5);
    scene.add(backLight);
    
    // 2. Загрузка модели
    const loader = new GLTFLoader();
    
    loader.load(
        modelUrl, 
        (gltf) => {
            try {
                const model = gltf.scene;
                
                // Центруем модель
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // Перемещаем модель в центр
                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;
                
                scene.add(model);
                
                // Ставим камеру
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
                
                camera.position.set(0, maxDim * 0.2, cameraZ);
                camera.lookAt(0, maxDim * 0.1, 0);
                
                // Добавляем небольшую подсветку снизу
                const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
                fillLight.position.set(0, -1, 1);
                scene.add(fillLight);
                
                // 3. Рендер ОДНОГО кадра
                renderer.render(scene, camera);
                
                // 4. Фотографирование (Canvas -> Base64 String)
                const dataURL = renderer.domElement.toDataURL('image/jpeg', 0.9);
                
                // 5. Сохраняем строку в скрытый инпут
                hiddenInput.value = dataURL;
                
                // Разблокируем кнопку
                submitBtn.disabled = false;
                submitBtn.innerText = "✅ Загрузить в базу";
                submitBtn.style.backgroundColor = "#28a745";
                
                console.log("✅ Скриншот создан!");
                
                // Очищаем память
                URL.revokeObjectURL(modelUrl);
                
            } catch (err) {
                console.error('Ошибка при обработке модели:', err);
                previewContainer.innerHTML = '<div style="color: red; padding: 20px;">❌ Ошибка при создании превью</div>';
            }
        },
        (progress) => {
            // Опционально: показываем прогресс
            if (progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`Загрузка модели: ${percent}%`);
            }
        },
        (err) => {
            console.error('Ошибка загрузки модели:', err);
            previewContainer.innerHTML = '<div style="color: red; padding: 20px;">❌ Ошибка загрузки модели<br><small>Проверьте формат файла</small></div>';
            URL.revokeObjectURL(modelUrl);
        }
    );
}

// Добавим стили для кнопки когда она разблокирована
const style = document.createElement('style');
style.textContent = `
    #submit-btn {
        transition: all 0.3s ease;
    }
    #submit-btn:not(:disabled) {
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
    }
    #submit-btn:not(:disabled):hover {
        background-color: #218838;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }
`;
document.head.appendChild(style);