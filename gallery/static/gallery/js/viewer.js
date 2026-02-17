import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function loadModel(containerId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Контейнер не найден:", containerId);
        return;
    }
    
    console.log('Загрузка модели:', modelUrl, 'в контейнер:', containerId);
    
    // 1. Стандартная настройка сцены
    const scene = new THREE.Scene();
    scene.background = null; // Прозрачный фон

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Очищаем контейнер
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Орбитал контролы
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.1;
    controls.maxDistance = 10;

    // 3. Окружение и свет
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment).texture;

    // Добавим базовый свет для надежности
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 4. Создаем лоадер
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader-overlay';
    loaderDiv.innerHTML = `
        <div style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">Loading...</div>
        <div class="progress-bar" style="width: 80%; height: 4px; background: #eee; border-radius: 2px; overflow: hidden; margin: 0 auto;">
            <div class="progress-fill" style="height: 100%; width: 0%; background: #007bff; transition: width 0.3s;"></div>
        </div>
    `;
    
    // Стили для лоадера
    loaderDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
        background: rgba(255,255,255,0.9);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: opacity 0.3s;
    `;
    
    container.style.position = 'relative';
    container.appendChild(loaderDiv);
    
    const progressFill = loaderDiv.querySelector('.progress-fill');
    
    // 5. Загрузка модели
    const loader = new GLTFLoader();
    let loadedModel = null;

    loader.load(
        modelUrl,
        // Успех
        (gltf) => {
            console.log('✅ Модель успешно загружена');
            loadedModel = gltf.scene;
            
            // Настраиваем тени
            loadedModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            // Центрируем модель
            fitCameraToObject(camera, loadedModel, controls, 1.5);
            
            scene.add(loadedModel);
            
            // Скрываем лоадер
            loaderDiv.style.opacity = '0';
            setTimeout(() => {
                loaderDiv.remove();
            }, 300);
        },
        // Прогресс
        (xhr) => {
            if (xhr.total > 0) {
                const percent = (xhr.loaded / xhr.total) * 100;
                progressFill.style.width = percent + '%';
                console.log(`Прогресс: ${Math.round(percent)}%`);
            }
        },
        // Ошибка
        (error) => {
            console.error('❌ Ошибка загрузки модели:', error);
            loaderDiv.innerHTML = `
                <div class="error-msg" style="color: red; padding: 10px;">
                    ❌ Ошибка загрузки<br>
                    <small style="color: #666;">Проверьте файл</small>
                </div>
            `;
        }
    );

    // 6. Анимация
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 7. Resize handler
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}

function fitCameraToObject(camera, object, controls, offset = 1.25) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    // Центрируем модель
    object.position.x = -center.x;
    object.position.y = -center.y;
    object.position.z = -center.z;

    // Вычисляем позицию камеры
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= offset;

    // Устанавливаем камеру
    camera.position.set(0, maxDim * 0.3, cameraZ);
    camera.lookAt(0, maxDim * 0.1, 0);
    
    // Обновляем controls target
    if (controls) {
        controls.target.set(0, maxDim * 0.1, 0);
        controls.update();
    }

    camera.updateProjectionMatrix();
}