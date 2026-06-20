/**
 * Mutlu Yıllar - 3D İnteraktif Aile Ağacı Uygulaması
 */

// --- GLOBAL DURUM YÖNETİMİ & VERİLER ---
let currentStep = 0; 
let isAudioPlaying = false;

// Kişiselleştirilmiş Mesaj Veri Tabanı
const memberMessages = {
    "İbrahim": "Sevgili Babam İbrahim,\nAilemizin ulu çınarı, iyi ki varsın. Doğum günün kutlu olsun!",
    "Fatma": "Canım Annem Fatma,\nDünyanın en tatlı, en fedakar annesi. Yeni yaşın sana tüm güzellikleri getirsin. Seni çok seviyoruz!",
    "Nihal": "Sevgili Nihal,\nAilemizin neşe kaynaklarından biri. Doğum gününde tüm dileklerinin gerçekleşmesi dileğiyle!",
    "Hilal": "Sevgili Hilal,\nYüreği güzel insan, hayat boyu mutluluk ve huzur seninle olsun. Mutlu yıllar!",
    "Ali": "Sevgili Ali,\nBaşarı, sağlık ve mutluluk dolu harika bir yaş geçirmen dileğiyle. Doğum günün kutlu olsun!",
    "Semih": "Sevgili Semih,\nAilemizin en değerlilerinden, yeni yaşında her şey gönlünce olsun. Mutlu yıllar!",
    "Özkan": "Sevgili Özkan,\nAilemize kattığın tüm güzellikler için teşekkürler. Sağlıklı ve mutlu yıllara!",
    "Efe": "Sevgili Efe,\nGeleceğin hep parlak, başarıların daim olsun. Doğum günün kutlu olsun yakışıklı!",
    "Arda": "Sevgili Arda,\nYüzündeki gülücükler hiç eksik olmasın. Yeni yaşın sana şans getirsin!",
    "Emir": "Sevgili Emir,\nAilemizin en küçüğü, en tatlısı. Sağlık ve neşe dolu büyümen dileğiyle!"
};

// Ağaç Düğümleri Tanımlamaları (Konum, Ölçek ve Durum Bilgileri)
const nodesData = [
    { id: "İbrahim", name: "İbrahim", step: 0, pos: [0, 15, 0], size: 1.5 },
    { id: "Fatma", name: "Fatma", step: 1, pos: [4, 15, 0], size: 1.5 },
    
    { id: "Nihal", name: "Nihal", step: 2, pos: [-7, 5, 0], size: 1.2 },
    { id: "Hilal", name: "Hilal", step: 2, pos: [-2, 5, 0], size: 1.1 },
    { id: "Ali", name: "Ali", step: 2, pos: [3, 5, 0], size: 1.0 },
    { id: "Semih", name: "Semih", step: 2, pos: [8, 5, 0], size: 0.9 },
    
    { id: "Özkan", name: "Özkan", step: 3, pos: [-2, 10, -3], size: 1.1 },
    
    { id: "Efe", name: "Efe", step: 4, pos: [-5, -5, 0], size: 0.8 },
    { id: "Arda", name: "Arda", step: 4, pos: [-2, -5, 0], size: 0.7 },
    { id: "Emir", name: "Emir", step: 4, pos: [1, -5, 0], size: 0.6 }
];

// Bağlantı Çizgileri Tanımlamaları
const linesData = [
    { from: "İbrahim", to: "Fatma", step: 1 },
    { from: "İbrahim", to: "Nihal", step: 2 },
    { from: "İbrahim", to: "Hilal", step: 2 },
    { from: "İbrahim", to: "Ali", step: 2 },
    { from: "İbrahim", to: "Semih", step: 2 },
    { from: "Hilal", to: "Özkan", step: 3 },
    { from: "Hilal", to: "Efe", step: 4 },
    { from: "Hilal", to: "Arda", step: 4 },
    { from: "Hilal", to: "Emir", step: 4 }
];

// --- THREE.JS KURULUMU ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0308, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 25);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 50;
controls.minDistance = 10;

// Işıklandırma
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffb6c1, 1.2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xff1493, 1, 30);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);

// Raycaster ve Mouse Vektörleri (Tıklama Tespiti İçin)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Nesne Havuzları
const heartNodes = [];
const connectionLines = [];

// --- GEOMETRİ VE MATERYAL ÜRETİCİLERİ ---

// 3D Kalp Şekli Çizimi (THREE.Shape)
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0);
heartShape.bezierCurveTo(0, 0.5, 0.5, 1, 1.2, 1);
heartShape.bezierCurveTo(2.2, 1, 2.2, -0.5, 2.2, -0.5);
heartShape.bezierCurveTo(2.2, -1.3, 1.3, -2.3, 0, -3);
heartShape.bezierCurveTo(-1.3, -2.3, -2.2, -1.3, -2.2, -0.5);
heartShape.bezierCurveTo(-2.2, -0.5, -2.2, 1, -1.2, 1);
heartShape.bezierCurveTo(-0.5, 1, 0, 0.5, 0, 0);

const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
heartGeometry.center(); // Geometriyi merkezle
heartGeometry.rotateZ(Math.PI); // Kalbi düzelt (ters dönmesini engelle)

// Parlayan Pembe Kalp Materyali
const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3366,
    roughness: 0.2,
    metalness: 0.1,
    emissive: 0x3a0011,
    side: THREE.DoubleSide
});

// Canvas Üzerinde İsim Dokusu Oluşturma (Sprite için)
function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'Bold 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 1, 1);
    return sprite;
}

// --- PARTİKÜL SİSTEMİ (Uçuşan Kalpler) ---
const particleCount = 60;
const particleGeometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
particleGeometry.center();
particleGeometry.rotateZ(Math.PI);

const particleGroup = new THREE.Group();
const particlesData = [];

for (let i = 0; i < particleCount; i++) {
    const pMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff6b8b : 0xff4757,
        transparent: true,
        opacity: Math.random() * 0.4 + 0.2
    });
    const pMesh = new THREE.Mesh(particleGeometry, pMat);
    
    const scale = Math.random() * 0.15 + 0.05;
    pMesh.scale.set(scale, scale, scale);
    
    pMesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
    );
    
    particleGroup.add(pMesh);
    particlesData.push({
        mesh: pMesh,
        speedY: Math.random() * 0.02 + 0.01,
        rotSpeed: Math.random() * 0.01
    });
}
scene.add(particleGroup);

// --- AĞAÇ ÖGELERİNİ OLUŞTURMA VE GÜNCELLEME ---

function initTree() {
    // Tüm Kalp Düğümlerini Oluştur ve Sahneye Ekle (Başlangıçta ölçekleri 0)
    nodesData.forEach(data => {
        const pivot = new THREE.Group();
        pivot.position.set(...data.pos);
        
        const mesh = new THREE.Mesh(heartGeometry, heartMaterial.clone());
        mesh.scale.set(0, 0, 0); // Görünmez başla
        mesh.userData = { id: data.id, targetScale: data.size, currentScale: 0 };
        pivot.add(mesh);
        
        const label = createTextSprite(data.name);
        label.position.set(0, 2.2, 0);
        label.visible = false;
        pivot.add(label);
        
        scene.add(pivot);
        heartNodes.push({ data, pivot, mesh, label });
    });

    // Tüm Çizgileri Oluştur
    linesData.forEach(ld => {
        const fromNode = nodesData.find(n => n.id === ld.from);
        const toNode = nodesData.find(n => n.id === ld.to);
        
        const mat = new THREE.LineBasicMaterial({ color: 0xff6b8b, transparent: true, opacity: 0 });
        const geom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...fromNode.pos),
            new THREE.Vector3(...fromNode.pos) // Başlangıçta aynı nokta (boyu 0)
        ]);
        
        const line = new THREE.Line(geom, mat);
        scene.add(line);
        connectionLines.push({ data: ld, line, mat, fromNode, toNode, currentProgress: 0 });
    });
    
    updateTreeVisibility();
}

function updateTreeVisibility() {
    heartNodes.forEach(node => {
        if (node.data.step <= currentStep) {
            node.label.visible = true;
        }
    });
}

// --- ETKİLEŞİM VE TIKLAMA YÖNETİMİ ---

function startAudio() {
    if (!isAudioPlaying) {
        const music = document.getElementById('bg-music');
        music.play().then(() => {
            isAudioPlaying = true;
        }).catch(err => console.log("Müzik çalma başlatılamadı (Etkileşim gerekiyor):", err));
    }
}

function onWindowClick(event) {
    // Eğer modal açıksa arkadaki tıklamaları işleme
    if (!document.getElementById('message-modal').classList.contains('hidden')) return;

    startAudio();

    // Mouse koordinatlarını normalize et
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Sadece aktif basamakta olan veya görünen kalpleri tıkla
    const activeMeshes = heartNodes
        .filter(n => n.data.step <= currentStep)
        .map(n => n.mesh);

    const intersects = raycaster.intersectObjects(activeMeshes);

    if (intersects.length > 0) {
        // BİR KALBE TIKLANDI: Modalı Aç
        const clickedMesh = intersects[0].object;
        const memberId = clickedMesh.userData.id;
        openModal(memberId);
    } else {
        // BOŞLUĞA TIKLANDI: Ağaç Durumunu İlerlet
        if (currentStep < 4) {
            currentStep++;
            updateTreeVisibility();
        }
    }
}

// --- MODAL İŞLEMLERİ ---
function openModal(id) {
    const modal = document.getElementById('message-modal');
    document.getElementById('modal-title').innerText = id;
    document.getElementById('modal-body').innerText = memberMessages[id] || "Mesaj bulunamadı.";
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('message-modal').classList.add('hidden');
}

document.getElementById('modal-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
});

window.addEventListener('click', onWindowClick);

// --- ANIMASYON DÖNGÜSÜ (TICK) ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // 1. Partikül Hareketi
    particlesData.forEach(p => {
        p.mesh.position.y += p.speedY;
        p.mesh.rotation.x += p.rotSpeed;
        p.mesh.rotation.y += p.rotSpeed;
        
        // Ekrandan çıkanları aşağıdan tekrar sok
        if (p.mesh.position.y > 20) {
            p.mesh.position.y = -20;
            p.mesh.position.x = (Math.random() - 0.5) * 40;
        }
    });
    
    // 2. Kalp Düğümleri Yumuşak Geçiş (Lerp) & Kendi Etrafında Hafif Salınım
    heartNodes.forEach(node => {
        const mesh = node.mesh;
        const ud = mesh.userData;
        
        if (node.data.step <= currentStep) {
            // Görünmesi gerekiyor, hedef ölçeğe lerp yap
            ud.currentScale += (ud.targetScale - ud.currentScale) * 0.1;
        } else {
            // Henüz zamanı değil
            ud.currentScale += (0 - ud.currentScale) * 0.1;
        }
        mesh.scale.set(ud.currentScale, ud.currentScale, ud.currentScale);
        
        // Hafif romantik dönme ve dalgalanma efekti
        if (ud.currentScale > 0.1) {
            node.pivot.rotation.y = Math.sin(elapsedTime + node.data.pos[0]) * 0.15;
            node.pivot.position.y = node.data.pos[1] + Math.sin(elapsedTime * 2 + node.data.pos[0]) * 0.2;
        }
    });
    
    // 3. Bağlantı Çizgileri Dinamik Uzama (Lerp)
    connectionLines.forEach(cl => {
        if (cl.data.step <= currentStep) {
            cl.currentProgress += (1 - cl.currentProgress) * 0.08;
            cl.mat.opacity += (0.8 - cl.mat.opacity) * 0.08;
        }
        
        if (cl.currentProgress > 0.01) {
            const start = new THREE.Vector3(...cl.fromNode.pos);
            // Dinamik güncellenen uç konumu al (salınım dahil)
            const targetNodeObj = heartNodes.find(n => n.data.id === cl.toNode.id);
            const endTarget = targetNodeObj.pivot.position.clone();
            
            // Çizgiyi hedefe doğru uzat
            const currentEnd = new THREE.Vector3().lerpVectors(start, endTarget, cl.currentProgress);
            
            cl.line.geometry.setFromPoints([start, currentEnd]);
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// --- EKRAN BOYUTLANDIRMA ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Başlat
initTree();
animate();