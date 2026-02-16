import * as THREE from 'three';

export function mountSimpleCube(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Контейнер не найден:", containerId);
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';
    
    // Получаем размеры контейнера
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- А. СЦЕНА ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0); // Светло-серый фон

    // --- Б. КАМЕРА ---
    const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );
    camera.position.z = 2;

    // --- В. РЕНДЕРЕР (Художник) ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    
    container.appendChild(renderer.domElement);

    // --- Г. ОБЪЕКТ (Куб) ---
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x007bff,
        roughness: 0.3,
        metalness: 0.1
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // --- Д. СВЕТ ---
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Добавим подсветку снизу для красоты
    const backLight = new THREE.DirectionalLight(0xffaa00, 0.5);
    backLight.position.set(-2, -1, -2);
    scene.add(backLight);

    // --- Е. АНИМАЦИЯ ---
    function animate() {
        requestAnimationFrame(animate);
        
        // Вращаем куб
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    }
    
    animate();

    // --- Ж. АДАПТИВНОСТЬ (Resize) ---
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    });
}