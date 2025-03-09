import * as THREE from 'three';
import { KeyState, KeyBindings } from '../models/types';
import { KeyBindingManager } from './KeyBindingManager';

export class InputController {
  private keys: KeyState = {};
  private mouseDown: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseSensitivity: number = 0.002;
  private rightClickDown: boolean = false;
  private keyBindingManager: KeyBindingManager;
  
  constructor() {
    this.keyBindingManager = new KeyBindingManager();
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for keyboard and mouse input
   */
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Mouse events for camera rotation
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right mouse button
        this.rightClickDown = true;
        this.mouseDown = true;
      }
    });
    
    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) { // Right mouse button
        this.rightClickDown = false;
        this.mouseDown = false;
      }
    });
    
    window.addEventListener('mousemove', (e) => {
      if (this.mouseDown) {
        this.mouseX = e.movementX || 0;
        this.mouseY = e.movementY || 0;
      } else {
        this.mouseX = 0;
        this.mouseY = 0;
      }
    });
    
    // Prevent context menu on right-click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  /**
   * Check if a key is pressed
   */
  public isKeyPressed(key: string): boolean {
    return !!this.keys[key.toLowerCase()];
  }
  
  /**
   * Check if an action's key is pressed
   */
  public isActionPressed(actionId: keyof KeyBindings): boolean {
    const bindings = this.keyBindingManager.getBindings();
    return this.isKeyPressed(bindings[actionId]);
  }
  
  /**
   * Get mouse movement data for camera rotation
   */
  public getMouseMovement(): { x: number, y: number, active: boolean } {
    return {
      x: this.mouseX * this.mouseSensitivity,
      y: this.mouseY * this.mouseSensitivity,
      active: this.rightClickDown
    };
  }
  
  /**
   * Get the key binding manager
   */
  public getKeyBindingManager(): KeyBindingManager {
    return this.keyBindingManager;
  }
  
  /**
   * Handle player movement with WoW-style controls
   */
  public handlePlayerMovement(player: THREE.Object3D, camera: THREE.Camera, moveSpeed: number): boolean {
    let isMoving = false;
    let moveDirection = new THREE.Vector3(0, 0, 0);
    
    // Get camera's forward and right directions (ignore y component for ground movement)
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    cameraForward.y = 0;
    cameraForward.normalize();
    
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    cameraRight.y = 0;
    cameraRight.normalize();
    
    // Forward movement
    if (this.isActionPressed('moveForward')) {
      moveDirection.add(cameraForward);
      isMoving = true;
    }
    
    // Backward movement
    if (this.isActionPressed('moveBackward')) {
      moveDirection.sub(cameraForward);
      isMoving = true;
    }
    
    // Left movement
    if (this.isActionPressed('moveLeft')) {
      moveDirection.sub(cameraRight);
      isMoving = true;
    }
    
    // Right movement
    if (this.isActionPressed('moveRight')) {
      moveDirection.add(cameraRight);
      isMoving = true;
    }
    
    // Set player rotation based on camera direction when moving
    if (isMoving) {
      // Calculate angle from movement direction
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      player.rotation.y = angle;
      
      // Normalize movement direction
      moveDirection.normalize();
      
      // Apply movement
      player.position.x += moveDirection.x * moveSpeed;
      player.position.z += moveDirection.z * moveSpeed;
    }
    
    return isMoving;
  }
} 