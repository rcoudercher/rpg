import * as THREE from "three";
import { Gold } from "./components/Gold";
import { Knight } from "./components/Knight";
import { Sword } from "./components/Sword";
import { Wolf } from "./components/Wolf";
import { CameraController } from "./controllers/CameraController";
import { InputController } from "./controllers/InputController";
import { KeyBindingUI } from "./controllers/KeyBindingUI";
import { UIController } from "./controllers/UIController";
import { KnightUserData } from "./models/types";
import { Environment } from "./scenes/Environment";
import { GameAPI } from "./services/GameAPI";

// Create a global game instance for access from other components
declare global {
  interface Window {
    gameInstance: Game;
  }
}

// Define the custom event interface
interface WolfDeathEvent extends CustomEvent {
  detail: {
    position: THREE.Vector3;
    goldAmount: number;
  };
}

export class Game {
  private scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
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

  // Frame rate limiting
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / 60; // 16.67ms for 60 FPS
  private lastFrameTime: number = 0;

  private equippedWeapon: string | null = null;

  // Gold system
  private goldItems: Gold[] = [];
  private playerGold: number = 0;

  // Local storage keys
  private static readonly STORAGE_KEY_GOLD = "wow_game_gold";
  private static readonly STORAGE_KEY_EQUIPPED = "wow_game_equipped";
  private static readonly STORAGE_KEY_HAS_SWORD = "wow_game_has_sword";

  // Game over flag
  private isGameOver: boolean = false;

  constructor() {
    // Set global reference to this game instance
    window.gameInstance = this;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add lighting to the scene
    this.setupLighting();

    // Initialize controllers
    this.inputController = new InputController();
    this.uiController = new UIController();

    // Initialize key binding UI
    this.keyBindingUI = new KeyBindingUI(
      this.inputController.getKeyBindingManager(),
    );

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

    // Set up inventory actions
    this.uiController.setupInventoryActions(
      this.handleInventoryAction.bind(this),
    );

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
      metalness: 0.2,
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
    // Handle window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle inventory actions
    this.uiController.setupInventoryActions((action, item) => {
      this.handleInventoryAction(action, item);
    });

    // Handle reset button
    const resetButton = this.uiController.getResetButton();
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        this.resetGame();
      });
    }

    // Handle key binding button
    const keyBindingsButton = this.uiController.getKeyBindingsButton();
    keyBindingsButton.addEventListener("click", (e) => {
      console.log("Key bindings button clicked!");
      e.stopPropagation();
      this.keyBindingUI.toggle();
    });

    // Handle FPS toggle
    this.uiController.setupFPSToggle((limitFPS) => {
      this.setTargetFPS(limitFPS ? 60 : 0);
    });

    // Handle keyboard input for attack and controls
    window.addEventListener("keydown", (e) => {
      // Check if the key pressed is bound to attack
      if (this.inputController.isActionPressed("attack")) {
        this.handleAttack();
      }

      // Check if the key pressed is bound to toggleControls
      if (this.inputController.isActionPressed("toggleControls")) {
        this.uiController.toggleControlsGuide();
      }
    });

    // Handle wolf death for gold drops
    document.addEventListener("wolfDeath", ((event: WolfDeathEvent) => {
      const { position, goldAmount } = event.detail;
      this.dropGold(position, goldAmount);
      console.log(`Wolf dropped ${goldAmount} gold at position:`, position);
    }) as EventListener);
  }

  /**
   * Initialize game state
   */
  private async initGameState(): Promise<void> {
    try {
      // Initialize game state from server
      const playerData = await GameAPI.getPlayer();

      // Set player position
      this.knight.mesh.position.set(
        playerData.x,
        playerData.y || 0,
        playerData.z,
      );

      // Load saved state from local storage
      this.loadGameState();

      // Set up sword if player doesn't have it
      if (!playerData.inventory.includes("sword")) {
        this.sword.mesh.position.set(5, 0, 5);
        this.sword.setVisibility(true);
      } else {
        // If sword is in the player's inventory
        this.hasSword = true;
        this.sword.setVisibility(false);
      }

      // Apply equipped weapon if any
      if (this.equippedWeapon === "sword" && this.hasSword) {
        this.knight.equipWeapon("sword");
      }

      // Set up wolf
      this.wolf.mesh.position.set(10, 0, 10);

      // Set up camera
      this.cameraController.updateCamera();

      // Create player health display
      this.createHealthDisplay();

      // Update inventory display
      this.updateInventoryDisplay();
    } catch (error) {
      console.error("Error initializing game state:", error);
    }
  }

  /**
   * Load game state from local storage
   */
  private loadGameState(): void {
    try {
      // Load gold
      const savedGold = localStorage.getItem(Game.STORAGE_KEY_GOLD);
      if (savedGold) {
        this.playerGold = parseInt(savedGold, 10);
        console.log(`Loaded ${this.playerGold} gold from local storage`);
      }

      // Load equipped weapon
      const savedEquipped = localStorage.getItem(Game.STORAGE_KEY_EQUIPPED);
      if (savedEquipped) {
        this.equippedWeapon = savedEquipped;
        console.log(`Loaded equipped weapon: ${this.equippedWeapon}`);
      }

      // Load sword state
      const savedHasSword = localStorage.getItem(Game.STORAGE_KEY_HAS_SWORD);
      if (savedHasSword) {
        this.hasSword = savedHasSword === "true";
        console.log(
          `Loaded sword state: ${this.hasSword ? "has sword" : "no sword"}`,
        );
      }
    } catch (error) {
      console.error("Error loading game state from local storage:", error);
    }
  }

  /**
   * Save game state to local storage
   */
  private saveGameState(): void {
    try {
      // Save gold
      localStorage.setItem(Game.STORAGE_KEY_GOLD, this.playerGold.toString());

      // Save equipped weapon
      if (this.equippedWeapon) {
        localStorage.setItem(Game.STORAGE_KEY_EQUIPPED, this.equippedWeapon);
      } else {
        localStorage.removeItem(Game.STORAGE_KEY_EQUIPPED);
      }

      // Save sword state
      localStorage.setItem(
        Game.STORAGE_KEY_HAS_SWORD,
        this.hasSword.toString(),
      );

      console.log("Game state saved to local storage");
    } catch (error) {
      console.error("Error saving game state to local storage:", error);
    }
  }

  /**
   * Reset game
   */
  private async resetGame(): Promise<void> {
    try {
      // Reset game state on server
      await GameAPI.resetGame();

      // Reset player position
      this.knight.mesh.position.set(0, 0, 0);

      // Reset sword
      this.sword.setVisibility(true);
      this.hasSword = false;

      // Reset equipped weapon
      this.equippedWeapon = null;
      this.knight.unequipWeapon();

      // Reset gold
      this.playerGold = 0;

      // Reset wolf position and health
      this.wolf.reset();

      // Update inventory display
      this.updateInventoryDisplay();

      // Clear local storage
      localStorage.removeItem(Game.STORAGE_KEY_GOLD);
      localStorage.removeItem(Game.STORAGE_KEY_EQUIPPED);
      localStorage.removeItem(Game.STORAGE_KEY_HAS_SWORD);
      console.log("Local storage cleared");

      console.log("Game has been reset!");
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  }

  /**
   * Update method called on each animation frame
   */
  private animate(currentTime: number = 0): void {
    // Request next frame
    requestAnimationFrame((time) => this.animate(time));

    // Calculate time delta
    const deltaTime = currentTime - this.lastFrameTime;

    // Limit frame rate if needed
    if (deltaTime < this.frameInterval) {
      return;
    }

    // Update last frame time
    this.lastFrameTime = currentTime;

    // Update UI frame rate display
    this.uiController.updateFrameRate();

    // Update player health display
    this.updateHealthDisplay();

    // Skip game updates if key binding UI is open
    if (this.keyBindingUI.isOpen()) {
      // Just render the scene
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Check if player is dead
    if (this.knight.getHealth() <= 0) {
      // Show game over screen if not already showing
      if (!this.isGameOver) {
        this.showGameOverScreen();
      }

      // Still render the scene but don't update game logic
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.isAnimating) {
      // Get mouse movement for camera rotation
      const mouseMovement = this.inputController.getMouseMovement();

      // Update camera with mouse movement
      this.cameraController.updateCamera(mouseMovement);

      // Handle player movement
      let isMoving = false;
      isMoving = this.inputController.handlePlayerMovement(
        this.knight.mesh,
        this.camera,
        this.moveSpeed,
      );

      // Animate knight
      this.knight.animate(isMoving);

      // Update wolf behavior
      const validTime = currentTime > 0 ? currentTime : Date.now();
      this.wolf.update(this.knight.mesh.position, validTime, this.knight);

      // Update gold animations
      this.goldItems.forEach((gold) => gold.update());

      // Check for gold collection
      this.checkGoldCollection();

      // Check if player is near the sword for pickup
      if (!this.hasSword && this.sword.mesh.visible) {
        const distanceToSword = this.knight.mesh.position.distanceTo(
          this.sword.mesh.position,
        );
        if (distanceToSword < 2) {
          this.pickupSword();
        }
      }

      // Render scene
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle attack action
   */
  private handleAttack(): void {
    // Trigger knight attack animation
    this.knight.attack();

    // Check if wolf is in attack range
    const attackRange = 3; // 3 units range for attack
    const distanceToWolf = this.knight.mesh.position.distanceTo(
      this.wolf.mesh.position,
    );

    if (distanceToWolf <= attackRange) {
      // Calculate damage based on equipped weapon
      const damage = this.equippedWeapon === "sword" ? 20 : 5; // Sword: 20 damage, Fists: 5 damage

      // Apply damage to wolf with current time
      const currentTime = Date.now();
      this.wolf.takeDamage(damage, currentTime);

      // Log the damage
      const wolfHealth = (this.wolf.mesh.userData as any).currentHealth;
      console.log(`Hit wolf for ${damage} damage! Wolf health: ${wolfHealth}`);
    } else {
      console.log(
        `Attack missed! Wolf is ${distanceToWolf.toFixed(1)} units away.`,
      );
    }
  }

  /**
   * Handle inventory actions
   */
  private handleInventoryAction(action: string, item: string): void {
    if (action === "equip") {
      this.equippedWeapon = item;
      this.knight.equipWeapon(item);
      console.log(`Equipped ${item}`);
    } else if (action === "unequip") {
      this.equippedWeapon = null;
      this.knight.unequipWeapon();
      console.log(`Unequipped ${item}`);
    }

    // Update inventory display with equipped weapon
    this.updateInventoryDisplay();

    // Save game state to local storage
    this.saveGameState();
  }

  /**
   * Update inventory display
   */
  private updateInventoryDisplay(): void {
    try {
      // Get inventory from game state
      const inventory = this.getPlayerInventory();

      // Update UI with inventory and equipped weapon
      this.uiController.updateInventoryDisplay(inventory, this.equippedWeapon);
    } catch (error) {
      console.error("Error updating inventory display:", error);
    }
  }

  /**
   * Get player inventory
   */
  private getPlayerInventory(): string[] {
    // Return sword if it's been picked up
    const inventory = this.hasSword ? ["sword"] : [];

    // Add gold to inventory display
    if (this.playerGold > 0) {
      inventory.push(`gold: ${this.playerGold}`);
    }

    return inventory;
  }

  /**
   * Pick up sword
   */
  private async pickupSword(): Promise<void> {
    try {
      const response = await GameAPI.pickupItem("sword");
      this.sword.setVisibility(false);
      this.hasSword = true;

      // Update inventory display with the updated inventory from server
      this.updateInventoryDisplay();

      // Save game state to local storage
      this.saveGameState();
    } catch (error) {
      console.error("Error picking up sword:", error);
    }
  }

  /**
   * Set target frame rate
   */
  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * Drop gold at the specified position
   */
  private dropGold(position: THREE.Vector3, amount: number): void {
    const gold = new Gold(position, amount);
    this.scene.add(gold.mesh);
    this.goldItems.push(gold);
  }

  /**
   * Check if player is near any gold to collect it
   */
  private checkGoldCollection(): void {
    const playerPosition = this.knight.mesh.position;

    // Check each gold item
    for (let i = this.goldItems.length - 1; i >= 0; i--) {
      const gold = this.goldItems[i];
      const distance = playerPosition.distanceTo(gold.mesh.position);

      // If player is close enough, collect the gold
      if (distance < 1.5) {
        this.collectGold(i);
      }
    }
  }

  /**
   * Collect gold at the specified index
   */
  private collectGold(index: number): void {
    const gold = this.goldItems[index];

    // Add gold to player's inventory
    this.playerGold += gold.amount;

    // Remove gold from scene
    this.scene.remove(gold.mesh);

    // Remove gold from array
    this.goldItems.splice(index, 1);

    // Update inventory display
    this.updateInventoryDisplay();

    // Save game state to local storage
    this.saveGameState();

    // Show gold collection notification
    this.showGoldNotification(gold.amount);

    console.log(`Collected ${gold.amount} gold. Total: ${this.playerGold}`);
  }

  /**
   * Show a notification when gold is collected
   */
  private showGoldNotification(amount: number): void {
    // Create notification container
    const notification = document.createElement("div");
    notification.style.position = "absolute";
    notification.style.top = "50%";
    notification.style.left = "50%";
    notification.style.transform = "translate(-50%, -50%)";
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.justifyContent = "center";
    notification.style.gap = "10px";
    notification.style.pointerEvents = "none"; // Don't block clicks
    notification.style.zIndex = "1000";
    notification.style.opacity = "1";
    notification.style.transition =
      "opacity 1s ease-out, transform 1s ease-out";

    // Create money bag icon
    const coinIcon = document.createElement("div");
    coinIcon.innerHTML = "💰"; // Money bag icon
    coinIcon.style.fontSize = "36px";

    // Create text element
    const textElement = document.createElement("div");
    textElement.textContent = `+${amount} Gold`;
    textElement.style.color = "#FFD700"; // Gold color
    textElement.style.fontFamily = "Arial, sans-serif";
    textElement.style.fontSize = "32px";
    textElement.style.fontWeight = "bold";
    textElement.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.7)";

    // Add elements to notification
    notification.appendChild(coinIcon);
    notification.appendChild(textElement);

    // Add to document
    document.body.appendChild(notification);

    // Animate and remove after animation
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translate(-50%, -100%)";

      // Remove from DOM after animation
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 1000);
    }, 50);
  }

  /**
   * Show game over screen
   */
  private showGameOverScreen(): void {
    this.isGameOver = true;

    // Create game over container
    const gameOverContainer = document.createElement("div");
    gameOverContainer.id = "game-over-screen";
    gameOverContainer.style.position = "fixed";
    gameOverContainer.style.top = "0";
    gameOverContainer.style.left = "0";
    gameOverContainer.style.width = "100%";
    gameOverContainer.style.height = "100%";
    gameOverContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    gameOverContainer.style.display = "flex";
    gameOverContainer.style.flexDirection = "column";
    gameOverContainer.style.justifyContent = "center";
    gameOverContainer.style.alignItems = "center";
    gameOverContainer.style.zIndex = "2000";

    // Game over text
    const gameOverText = document.createElement("h1");
    gameOverText.textContent = "GAME OVER";
    gameOverText.style.color = "#FF0000";
    gameOverText.style.fontSize = "72px";
    gameOverText.style.fontFamily = "Arial, sans-serif";
    gameOverText.style.marginBottom = "30px";
    gameOverText.style.textShadow = "0 0 10px #FF0000";

    // Restart button
    const restartButton = document.createElement("button");
    restartButton.textContent = "RESTART GAME";
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "24px";
    restartButton.style.backgroundColor = "#333";
    restartButton.style.color = "#FFF";
    restartButton.style.border = "2px solid #FFF";
    restartButton.style.borderRadius = "5px";
    restartButton.style.cursor = "pointer";
    restartButton.style.transition = "all 0.3s";

    // Hover effect
    restartButton.addEventListener("mouseover", () => {
      restartButton.style.backgroundColor = "#555";
    });

    restartButton.addEventListener("mouseout", () => {
      restartButton.style.backgroundColor = "#333";
    });

    // Restart game on click
    restartButton.addEventListener("click", () => {
      this.restartGame();
    });

    // Add elements to container
    gameOverContainer.appendChild(gameOverText);
    gameOverContainer.appendChild(restartButton);

    // Add to document
    document.body.appendChild(gameOverContainer);
  }

  /**
   * Restart the game after game over
   */
  private restartGame(): void {
    // Remove game over screen
    const gameOverScreen = document.getElementById("game-over-screen");
    if (gameOverScreen) {
      document.body.removeChild(gameOverScreen);
    }

    // Reset game state
    this.resetGame();

    // Reset player health
    const knightData = this.knight.mesh.userData as KnightUserData;
    knightData.currentHealth = knightData.maxHealth;

    // Reset game over flag
    this.isGameOver = false;
  }

  /**
   * Create player health display
   */
  private createHealthDisplay(): void {
    // Create health bar container
    const healthContainer = document.createElement("div");
    healthContainer.id = "player-health";
    healthContainer.style.position = "fixed";
    healthContainer.style.top = "20px";
    healthContainer.style.left = "20px";
    healthContainer.style.width = "200px";
    healthContainer.style.height = "30px";
    healthContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    healthContainer.style.border = "2px solid #FFF";
    healthContainer.style.borderRadius = "5px";
    healthContainer.style.overflow = "hidden";
    healthContainer.style.zIndex = "1000";

    // Create health bar
    const healthBar = document.createElement("div");
    healthBar.id = "health-bar";
    healthBar.style.width = "100%";
    healthBar.style.height = "100%";
    healthBar.style.backgroundColor = "#00CC00";
    healthBar.style.transition = "width 0.3s";

    // Create health text
    const healthText = document.createElement("div");
    healthText.id = "health-text";
    healthText.style.position = "absolute";
    healthText.style.top = "50%";
    healthText.style.left = "50%";
    healthText.style.transform = "translate(-50%, -50%)";
    healthText.style.color = "#FFF";
    healthText.style.fontFamily = "Arial, sans-serif";
    healthText.style.fontWeight = "bold";
    healthText.style.textShadow = "1px 1px 2px #000";
    healthText.textContent = "100/100";

    // Add elements to container
    healthContainer.appendChild(healthBar);
    healthContainer.appendChild(healthText);

    // Add to document
    document.body.appendChild(healthContainer);

    // Update health display initially
    this.updateHealthDisplay();
  }

  /**
   * Update player health display
   */
  private updateHealthDisplay(): void {
    const healthBar = document.getElementById("health-bar");
    const healthText = document.getElementById("health-text");

    if (healthBar && healthText) {
      const currentHealth = this.knight.getHealth();
      const maxHealth = 100;
      const healthPercent = (currentHealth / maxHealth) * 100;

      // Update health bar width
      healthBar.style.width = `${healthPercent}%`;

      // Update health text
      healthText.textContent = `${currentHealth}/${maxHealth}`;

      // Change color based on health percentage
      if (healthPercent > 60) {
        healthBar.style.backgroundColor = "#00CC00"; // Green
      } else if (healthPercent > 30) {
        healthBar.style.backgroundColor = "#CCCC00"; // Yellow
      } else {
        healthBar.style.backgroundColor = "#CC0000"; // Red
      }
    }
  }
}
