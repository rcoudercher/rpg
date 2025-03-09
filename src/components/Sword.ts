import * as THREE from 'three';

export class Sword {
  public mesh: THREE.Group;
  
  constructor() {
    this.mesh = this.createSword();
  }
  
  private createSword(): THREE.Group {
    // Create a sword group to hold all parts
    const swordGroup = new THREE.Group();
    
    // Sword blade
    const bladeGeometry = new THREE.BoxGeometry(0.1, 0.05, 1.5);
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, // Silver blade
      metalness: 0.9,
      roughness: 0.1
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, 0, 0.5);
    swordGroup.add(blade);
    
    // Sword tip (make it pointy)
    const tipGeometry = new THREE.ConeGeometry(0.05, 0.2, 4);
    const tip = new THREE.Mesh(tipGeometry, bladeMaterial);
    tip.position.set(0, 0, 1.35);
    tip.rotation.x = Math.PI / 2;
    swordGroup.add(tip);
    
    // Sword guard (crossguard)
    const guardGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.1);
    const guardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xb59410, // Gold guard
      metalness: 0.8,
      roughness: 0.2
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(0, 0, -0.25);
    swordGroup.add(guard);
    
    // Sword handle
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5c3c10, // Brown handle
      metalness: 0.1,
      roughness: 0.9
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0, -0.5);
    handle.rotation.x = Math.PI / 2;
    swordGroup.add(handle);
    
    // Sword pommel (end of handle)
    const pommelGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const pommel = new THREE.Mesh(pommelGeometry, guardMaterial);
    pommel.position.set(0, 0, -0.75);
    swordGroup.add(pommel);
    
    // Position the sword
    swordGroup.position.set(5, 0.5, 0);
    // Rotate to lay flat on ground
    swordGroup.rotation.y = Math.PI / 4;
    
    // Add a subtle glow effect
    const swordLight = new THREE.PointLight(0xffffcc, 0.5, 2);
    swordLight.position.set(0, 0.1, 0);
    swordGroup.add(swordLight);
    
    return swordGroup;
  }
  
  /**
   * Position the sword away from the central platform of the ruins
   */
  public positionOnPlatform(): void {
    // Position the sword away from the player's spawn point (which is at 0,0,0)
    this.mesh.position.set(8, 0.5, 7); // Positioned in a corner of the ruins area
    this.mesh.rotation.y = Math.PI / 3; // Angled slightly
  }
  
  /**
   * Show or hide the sword
   */
  public setVisibility(visible: boolean): void {
    this.mesh.visible = visible;
  }
  
  /**
   * Check if the sword is close to a position
   */
  public isCloseToPosition(position: THREE.Vector3, threshold: number = 1): boolean {
    return this.mesh.position.distanceTo(position) < threshold;
  }
} 