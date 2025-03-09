import * as THREE from 'three';
import { Knight } from './components/Knight';
import { Wolf } from './components/Wolf';
import { Sword } from './components/Sword';
import { CameraController } from './controllers/CameraController';
import { InputController } from './controllers/InputController';
import { UIController } from './controllers/UIController';
import { GameAPI } from './services/GameAPI';
import { Environment } from './scenes/Environment';
import { KeyBindingUI } from './controllers/KeyBindingUI';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  private knight: Knight;
  private wolf: Wolf;
  private sword: Sword;
  private environment: Environment;
  
  private cameraController: CameraController;
  private inputController: InputController;
  private uiController: UIController;
  
  private hasSword: boolean = false;
  private isAnimating: boolean = true;
  private moveSpeed: number = 0.2;
  
  private keyBindingUI: KeyBindingUI;
  
  constructor() {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    // Add lighting to the scene
    this.setupLighting();
    
    // Initialize controllers
    this.inputController = new InputController();
    this.uiController = new UIController();
    
    // Initialize key binding UI
    this.keyBindingUI = new KeyBindingUI(this.inputController.getKeyBindingManager());
    
    // Initialize game objects
    this.knight = new Knight();
    this.wolf = new Wolf();
    this.sword = new Sword();
    this.environment = new Environment(this.scene);
    
    // Add objects to scene
    this.scene.add(this.knight.mesh);
    this.scene.add(this.wolf.mesh);
    this.scene.add(this.sword.mesh);
    
    // Position the sword on the platform
    this.sword.positionOnPlatform();
    
    // Initialize camera controller
    this.cameraController = new CameraController(this.camera, this.knight.mesh);
    // Initialize camera rotation
    this.cameraController.resetCameraRotation();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize game state
    this.initGameState();
    
    // Initialize UI with empty inventory
    this.uiController.updateInventoryDisplay([]);
    this.uiController.updateWolfStatus(false);
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Set up lighting for the scene
   */
  private setupLighting(): void {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light (sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Add a hemisphere light for better outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3d3d3d, 0.6);
    this.scene.add(hemisphereLight);
    
    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x33aa33,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = 0; // Position at y=0
    this.scene.add(ground);
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Reset button
    const resetButton = this.uiController.getResetButton();
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetGame());
    }
    
    // Key bindings button
    const keyBindingsButton = this.uiController.getKeyBindingsButton();
    if (keyBindingsButton) {
      keyBindingsButton.addEventListener('click', (e) => {
        console.log('Key bindings button clicked!');
        e.stopPropagation();
        this.keyBindingUI.toggle();
      });
    }
    
    // Toggle controls with key press
    window.addEventListener('keydown', (e) => {
      // Check if the key pressed is bound to toggleControls
      if (this.inputController.isActionPressed('toggleControls')) {
        this.uiController.toggleControlsGuide();
      }
    });
  }
  
  /**
   * Initialize game state from server
   */
  private async initGameState(): Promise<void> {
    try {
      const playerData = await GameAPI.getPlayer();
      
      // Start the player in the center of the ruins (on the platform)
      if (playerData.x === 0 && playerData.z === 0) {
        this.knight.mesh.position.set(0, 0.2, 0); // On the central platform (0.2 is the platform height)
      } else {
        this.knight.mesh.position.set(playerData.x, 0, playerData.z);
      }
      
      // Set initial camera position behind player
      this.cameraController.updateCamera();
      
      if (playerData.inventory.includes('sword')) {
        this.sword.setVisibility(false);
        this.hasSword = true;
      }
      
      // Initialize inventory display with data from server
      this.uiController.updateInventoryDisplay(playerData.inventory);
      this.uiController.updateWolfStatus(false);
    } catch (error) {
      console.error('Error initializing game state:', error);
    }
  }
  
  /**
   * Reset game state
   */
  private async resetGame(): Promise<void> {
    try {
      const response = await GameAPI.resetGame();
      console.log('Game reset:', response);
      
      // Reset player position and rotation - place on the central platform
      this.knight.mesh.position.set(0, 1, 0);
      this.knight.mesh.rotation.y = 0;
      
      // Reset player animation
      this.knight.resetAnimation();
      
      // Reset sword
      this.sword.setVisibility(true);
      this.hasSword = false;
      
      // Reset wolf position
      this.wolf.reset();
      
      // Update inventory display
      this.uiController.updateInventoryDisplay([]);
      
      console.log('Game has been reset!');
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }
  
  /**
   * Animation loop
   */
  private animate(): void {
    if (!this.isAnimating) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Skip game updates if key binding UI is open
    if (this.keyBindingUI.isOpen()) {
      // Just render the scene
      this.renderer.render(this.scene, this.camera);
      return;
    }
    
    // Get current time for animations
    const currentTime = Date.now();
    
    // Get mouse movement for camera rotation
    const mouseMovement = this.inputController.getMouseMovement();
    
    // Update camera with mouse movement
    this.cameraController.updateCamera(mouseMovement);
    
    // Handle player movement
    let isMoving = false;
    isMoving = this.inputController.handlePlayerMovement(this.knight.mesh, this.camera, this.moveSpeed);
    
    // Animate knight
    this.knight.animate(isMoving);
    
    // Update wolf behavior
    this.wolf.update(this.knight.mesh.position, currentTime);
    
    // Update environment animations
    this.environment.updateEnvironment();
    
    // Check for wolf proximity and update UI
    const wolfData = this.wolf.mesh.userData;
    if (wolfData && typeof wolfData.isFollowing === 'boolean') {
      this.uiController.updateWolfStatus(wolfData.isFollowing);
    }
    
    // Check for sword pickup
    if (!this.hasSword && this.sword.mesh.visible) {
      const distance = this.sword.mesh.position.distanceTo(this.knight.mesh.position);
      if (distance < 3) {
        console.log(`Close to sword! Distance: ${distance.toFixed(2)}`);
        this.pickupSword();
      }
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Update player position on server
   */
  private async updatePlayerPosition(): Promise<void> {
    try {
      await GameAPI.updatePlayerPosition(
        this.knight.mesh.position.x,
        this.knight.mesh.position.y,
        this.knight.mesh.position.z
      );
    } catch (error) {
      console.error('Error updating player position:', error);
    }
  }
  
  /**
   * Pick up sword
   */
  private async pickupSword(): Promise<void> {
    try {
      const response = await GameAPI.pickupItem('sword');
      this.sword.setVisibility(false);
      this.hasSword = true;
      
      // Update inventory display with the updated inventory from server
      this.uiController.updateInventoryDisplay(response.inventory);
    } catch (error) {
      console.error('Error picking up sword:', error);
    }
  }
} 