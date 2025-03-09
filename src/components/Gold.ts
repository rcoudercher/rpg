import * as THREE from "three";

export class Gold {
  public mesh: THREE.Group;
  public amount: number;
  private rotationSpeed: number = 0.02;
  private bobSpeed: number = 0.003;
  private bobHeight: number = 0.2;
  private initialY: number;
  private phase: number = Math.random() * Math.PI * 2; // Random starting phase

  constructor(position: THREE.Vector3, amount: number = 1) {
    this.amount = amount;
    this.mesh = this.createGold();
    this.mesh.position.copy(position);
    // Slightly raise the gold off the ground
    this.mesh.position.y += 0.2;
    this.initialY = this.mesh.position.y;

    // Store the gold amount in the userData
    this.mesh.userData = {
      isGold: true,
      amount: this.amount,
    };
  }

  /**
   * Create a gold coin mesh
   */
  private createGold(): THREE.Group {
    const goldGroup = new THREE.Group();

    // Create the coin
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold color
      metalness: 1,
      roughness: 0.3,
      emissive: 0xaa8500,
      emissiveIntensity: 0.2,
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2; // Make the coin flat
    goldGroup.add(coin);

    // Add edge details to the coin
    const edgeGeometry = new THREE.TorusGeometry(0.3, 0.03, 16, 32);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1,
      roughness: 0.2,
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.rotation.x = Math.PI / 2; // Align with the coin
    goldGroup.add(edge);

    // Add a simple glow effect
    const glowGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    goldGroup.add(glow);

    return goldGroup;
  }

  /**
   * Update the gold animation (rotation and bobbing)
   */
  public update(): void {
    // Rotate the gold
    this.mesh.rotation.y += this.rotationSpeed;

    // Make the gold bob up and down
    this.mesh.position.y =
      this.initialY + Math.sin(this.phase) * this.bobHeight;
    this.phase += this.bobSpeed;
  }
}
