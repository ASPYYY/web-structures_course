import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadModel(containerId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Контейнер не найден:", containerId);
        return;
    }
    
    console.log('Загрузка модели:', modelUrl, 'в контейнер:', containerId);
    
    // 1. Стандартная настройка сцены
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;

    // Очищаем контейнер и вставляем Canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-5, 5, -7);
    scene.add(backLight);

    // Переменная для хранения модели (доступна во всей функции)
    let loadedModel = null;

    // 3. Загрузка Модели
    const loader = new GLTFLoader();

    loader.load(
        modelUrl,
        (gltf) => {
            console.log('✅ Модель успешно загружена');
            loadedModel = gltf.scene;
            
            // Включаем тени для модели
            loadedModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            // Центрируем модель
            fitCameraToObject(camera, loadedModel, 1.5);
            
            scene.add(loadedModel);
        },
        (progress) => {
            // Прогресс загрузки
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`Прогресс: ${percent}%`);
        },
        (error) => {
            console.error('❌ Ошибка загрузки модели:', error);
            container.innerHTML = '<div style="color: red; padding: 20px;">❌ Ошибка загрузки</div>';
        }
    );

    // 4. Анимация
    function animate() {
        requestAnimationFrame(animate);

        // Вращаем модель, если она загружена
        if (loadedModel) {
            loadedModel.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();

    // 5. Resize handler
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}

function fitCameraToObject(camera, object, offset = 1.25) {
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

    camera.updateProjectionMatrix();
}