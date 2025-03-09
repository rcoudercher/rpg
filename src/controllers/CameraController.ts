import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private offset: THREE.Vector3;
  private lookOffset: THREE.Vector3;
  private cameraTarget: THREE.Vector3;
  private cameraRotation: { x: number, y: number } = { x: 0, y: 0 };
  private minPolarAngle: number = 0.1; // Minimum angle (looking up)
  private maxPolarAngle: number = Math.PI / 2; // Maximum angle (looking down)
  
  constructor(
    camera: THREE.PerspectiveCamera,
    target: THREE.Object3D,
    offset: THREE.Vector3 = new THREE.Vector3(0, 5, 10),
    lookOffset: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  ) {
    this.camera = camera;
    this.target = target;
    this.offset = offset;
    this.lookOffset = lookOffset;
    this.cameraTarget = new THREE.Vector3();
    
    // Set initial camera position
    this.updateCamera();
  }
  
  /**
   * Update camera position to follow target
   */
  public updateCamera(mouseMovement?: { x: number, y: number, active: boolean }): void {
    if (mouseMovement && mouseMovement.active) {
      // Update camera rotation based on mouse movement
      this.cameraRotation.x -= mouseMovement.x;
      this.cameraRotation.y -= mouseMovement.y;
      
      // Clamp vertical rotation to prevent camera flipping
      this.cameraRotation.y = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.cameraRotation.y));
    }
    
    // Calculate camera position based on target position and current rotation
    const distance = this.offset.length();
    
    // Calculate camera position using spherical coordinates
    const phi = this.cameraRotation.y; // Vertical angle
    const theta = this.cameraRotation.x; // Horizontal angle
    
    const x = distance * Math.sin(phi) * Math.sin(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.cos(theta);
    
    // Set camera position relative to target
    this.camera.position.x = this.target.position.x + x;
    this.camera.position.y = this.target.position.y + y;
    this.camera.position.z = this.target.position.z + z;
    
    // Make camera look at target
    this.cameraTarget.copy(this.target.position).add(this.lookOffset);
    this.camera.lookAt(this.cameraTarget);
  }
  
  /**
   * Set camera offset
   */
  public setOffset(offset: THREE.Vector3): void {
    this.offset.copy(offset);
  }
  
  /**
   * Set look offset
   */
  public setLookOffset(lookOffset: THREE.Vector3): void {
    this.lookOffset.copy(lookOffset);
  }
  
  /**
   * Reset camera rotation
   */
  public resetCameraRotation(): void {
    this.cameraRotation.x = 0;
    this.cameraRotation.y = Math.PI / 4; // Start with a slight downward angle
  }
} 