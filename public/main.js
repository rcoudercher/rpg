import * as THREE from 'three';
import axios from 'axios';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x33aa33 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player (knight)
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Wolf
const wolfGeometry = new THREE.BoxGeometry(1, 1, 1);
const wolfMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const wolf = new THREE.Mesh(wolfGeometry, wolfMaterial);
wolf.position.set(10, 0.5, 0);
scene.add(wolf);

// Sword
const swordGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
const swordMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const sword = new THREE.Mesh(swordGeometry, swordMaterial);
sword.position.set(5, 0.5, 0);
scene.add(sword);

// Camera position
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

// Movement controls
const moveSpeed = 0.2;
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game state
let hasSword = false;

// Animation loop
async function animate() {
    requestAnimationFrame(animate);

    // Handle movement
    if (keys['ArrowUp']) player.position.z -= moveSpeed;
    if (keys['ArrowDown']) player.position.z += moveSpeed;
    if (keys['ArrowLeft']) player.position.x -= moveSpeed;
    if (keys['ArrowRight']) player.position.x += moveSpeed;

    // Update player position on server
    try {
        await axios.post('/api/player/move', {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        });
    } catch (error) {
        console.error('Error updating player position:', error);
    }

    // Check sword pickup
    if (!hasSword && sword.visible) {
        const distance = player.position.distanceTo(sword.position);
        if (distance < 1) {
            try {
                await axios.post('/api/items/pickup', { itemType: 'sword' });
                sword.visible = false;
                hasSword = true;
            } catch (error) {
                console.error('Error picking up sword:', error);
            }
        }
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize game state from server
async function initGameState() {
    try {
        const playerData = await axios.get('/api/player');
        player.position.set(playerData.data.x, 1, playerData.data.z);
        
        if (playerData.data.inventory.includes('sword')) {
            sword.visible = false;
            hasSword = true;
        }
    } catch (error) {
        console.error('Error initializing game state:', error);
    }
}

initGameState();
animate(); 