import * as THREE from "three";
import { KnightUserData } from "../models/types";

export class Knight {
  public mesh: THREE.Group;
  private swordMesh: THREE.Mesh | null = null;

  constructor() {
    this.mesh = this.createKnight();
  }

  private createKnight(): THREE.Group {
    // Create a knight group to hold all parts
    const knightGroup = new THREE.Group();

    // Knight body (torso)
    const torsoGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777, // Silver/gray for armor
      metalness: 0.7,
      roughness: 0.3,
    });
    const torso = new THREE.Mesh(torsoGeometry, armorMaterial);
    torso.position.y = 1.0;
    knightGroup.add(torso);

    // Knight head (red hair instead of helmet)
    const headGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcca8, // Skin tone
      roughness: 0.7,
      metalness: 0.1,
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.8;
    knightGroup.add(head);

    // Red hair (wild, spiky style)
    const hairGroup = new THREE.Group();
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3300, // Bright red hair
      roughness: 0.9,
      metalness: 0.1,
    });

    // Create multiple hair spikes
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 0.35;

      const spikeGeometry = new THREE.ConeGeometry(0.08, 0.3, 4);
      const spike = new THREE.Mesh(spikeGeometry, hairMaterial);

      // Position spikes around the head
      spike.position.set(
        Math.sin(angle) * radius,
        0.2 + Math.random() * 0.2, // Vary height slightly
        Math.cos(angle) * radius,
      );

      // Angle spikes outward
      spike.rotation.x = Math.PI / 2 - 0.5;
      spike.rotation.z = angle;

      hairGroup.add(spike);
    }

    // Add hair to head
    head.add(hairGroup);

    // Bird-like features
    // Beak/nose
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
    const beakMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc00, // Yellow beak
      roughness: 0.7,
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(0, 0, 0.4);
    beak.rotation.x = Math.PI / 2;
    head.add(beak);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000, // Black eyes
      roughness: 0.5,
      metalness: 0.2,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.15, 0.1, 0.35);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.15, 0.1, 0.35);
    head.add(rightEye);

    // White of eyes
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White
      roughness: 0.5,
      metalness: 0.2,
    });

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    leftEyeWhite.position.set(0, 0, 0.05);
    leftEye.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    rightEyeWhite.position.set(0, 0, 0.05);
    rightEye.add(rightEyeWhite);

    // Small feathers on top of head (like a crest)
    const crestGroup = new THREE.Group();
    const crestMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5500, // Slightly different red for crest
      roughness: 0.9,
    });

    for (let i = 0; i < 5; i++) {
      const featherGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.05);
      const feather = new THREE.Mesh(featherGeometry, crestMaterial);

      // Position feathers in a row on top of head
      feather.position.set(0.2 - i * 0.1, 0.4, 0);

      // Angle feathers
      feather.rotation.z = 0.3 - i * 0.15;

      crestGroup.add(feather);
    }

    head.add(crestGroup);

    // Knight arms
    const armGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, armorMaterial);
    leftArm.position.set(0.55, 1.0, 0);
    leftArm.name = "leftArm"; // Add name for easier identification
    knightGroup.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armorMaterial);
    rightArm.position.set(-0.55, 1.0, 0);
    rightArm.name = "rightArm"; // Add name for easier identification
    knightGroup.add(rightArm);

    // Knight legs
    const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, armorMaterial);
    leftLeg.position.set(0.25, 0.4, 0);
    leftLeg.name = "leftLeg"; // Add name for easier identification
    knightGroup.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, armorMaterial);
    rightLeg.position.set(-0.25, 0.4, 0);
    rightLeg.name = "rightLeg"; // Add name for easier identification
    knightGroup.add(rightLeg);

    // Knight shield
    const shieldGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.5);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000aa, // Blue shield
      metalness: 0.3,
      roughness: 0.7,
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.set(-0.7, 1.0, 0.1);
    knightGroup.add(shield);

    // Initialize knight data
    knightGroup.userData = {
      animationPhase: 0,
      isWalking: false,
      isAttacking: false,
      attackAnimationPhase: 0,
      equippedWeapon: null,
    } as KnightUserData;

    // Position the knight
    knightGroup.position.set(0, 0, 0);

    return knightGroup;
  }

  /**
   * Animate the knight based on movement and attack state
   */
  public animate(isMoving: boolean): void {
    const knightData = this.mesh.userData as KnightUserData;

    // Update animation phase for walking
    if (isMoving && !knightData.isAttacking) {
      knightData.animationPhase += 0.15;
      knightData.isWalking = true;
    } else if (!isMoving && !knightData.isAttacking) {
      // Gradually return to standing position if not attacking
      if (knightData.isWalking) {
        knightData.animationPhase = 0;
        knightData.isWalking = false;
      }
    }

    // Update attack animation phase
    if (knightData.isAttacking) {
      knightData.attackAnimationPhase += 0.25; // Faster than walking animation

      // Complete attack animation after one cycle
      if (knightData.attackAnimationPhase >= Math.PI * 2) {
        knightData.isAttacking = false;
        knightData.attackAnimationPhase = 0;
      }
    }

    // Store references to limbs in userData to avoid index issues
    if (!knightData.limbs) {
      // Find limbs by name
      const leftArm = this.mesh.getObjectByName("leftArm") as THREE.Mesh;
      const rightArm = this.mesh.getObjectByName("rightArm") as THREE.Mesh;
      const leftLeg = this.mesh.getObjectByName("leftLeg") as THREE.Mesh;
      const rightLeg = this.mesh.getObjectByName("rightLeg") as THREE.Mesh;

      // Store references
      knightData.limbs = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
      };
    }

    const { leftArm, rightArm, leftLeg, rightLeg } = knightData.limbs;

    // Only animate if we found all limbs
    if (leftLeg && rightLeg && leftArm && rightArm) {
      if (knightData.isAttacking) {
        // Attack animation
        if (knightData.equippedWeapon === "sword") {
          // Sword attack animation - right arm swings in an arc
          rightArm.rotation.x =
            -Math.sin(knightData.attackAnimationPhase) * 1.5;
          rightArm.rotation.z = Math.cos(knightData.attackAnimationPhase) * 0.5;

          // Left arm stays relatively still during sword attack
          leftArm.rotation.x = 0;
          leftArm.rotation.z = 0;
        } else {
          // Fist attack animation - both arms punch forward alternately
          const punchPhase = knightData.attackAnimationPhase;

          // Right arm punches first
          rightArm.rotation.x = -Math.max(0, Math.sin(punchPhase) * 1.2);

          // Left arm punches second
          leftArm.rotation.x = -Math.max(
            0,
            Math.sin(punchPhase - Math.PI) * 1.2,
          );
        }

        // Legs stay in place during attack
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      } else if (isMoving) {
        // Walking animation
        leftLeg.rotation.x = Math.sin(knightData.animationPhase) * 0.5;
        rightLeg.rotation.x =
          Math.sin(knightData.animationPhase + Math.PI) * 0.5;

        // Animate arms for walking
        leftArm.rotation.x =
          Math.sin(knightData.animationPhase + Math.PI) * 0.3;
        rightArm.rotation.x = Math.sin(knightData.animationPhase) * 0.3;

        // Reset any rotation on z-axis
        leftArm.rotation.z = 0;
        rightArm.rotation.z = 0;
      } else {
        // Reset to standing position
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        leftArm.rotation.z = 0;
        rightArm.rotation.z = 0;
      }
    }

    // Update equipped weapon position if needed
    this.updateEquippedWeapon();
  }

  /**
   * Start attack animation
   */
  public attack(): void {
    const knightData = this.mesh.userData as KnightUserData;
    knightData.isAttacking = true;
    knightData.attackAnimationPhase = 0;
  }

  /**
   * Equip a weapon
   */
  public equipWeapon(weaponType: string): void {
    const knightData = this.mesh.userData as KnightUserData;
    knightData.equippedWeapon = weaponType;

    // Create and attach weapon mesh if it's a sword
    if (weaponType === "sword") {
      this.createEquippedSword();
    } else {
      // Remove any equipped weapon mesh
      this.removeEquippedWeapon();
    }
  }

  /**
   * Unequip current weapon
   */
  public unequipWeapon(): void {
    const knightData = this.mesh.userData as KnightUserData;
    knightData.equippedWeapon = null;
    this.removeEquippedWeapon();
  }

  /**
   * Create and attach a sword to the knight's hand
   */
  private createEquippedSword(): void {
    // Remove any existing weapon first
    this.removeEquippedWeapon();

    // Find the right arm to attach the sword to
    const rightArm = this.mesh.getObjectByName("rightArm") as THREE.Mesh;
    if (!rightArm) return;

    // Create sword
    const swordMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc, // Silver
      metalness: 0.9,
      roughness: 0.2,
    });

    // Sword blade
    const bladeGeometry = new THREE.BoxGeometry(0.08, 0.7, 0.02);
    const blade = new THREE.Mesh(bladeGeometry, swordMaterial);
    blade.position.y = 0.35; // Position at the end of the handle

    // Sword handle
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown
      metalness: 0.1,
      roughness: 0.8,
    });
    const handleGeometry = new THREE.BoxGeometry(0.06, 0.2, 0.06);
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);

    // Sword guard
    const guardGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.04);
    const guard = new THREE.Mesh(guardGeometry, swordMaterial);
    guard.position.y = 0.1;

    // Create sword group
    const sword = new THREE.Group();
    sword.add(blade);
    sword.add(handle);
    sword.add(guard);

    // Position and rotate the sword relative to the arm
    sword.position.set(0, 0, 0.2);
    sword.rotation.x = Math.PI / 2; // Point forward

    // Add sword to right arm
    rightArm.add(sword);

    // Store reference to the sword
    this.swordMesh = sword as unknown as THREE.Mesh;
  }

  /**
   * Remove any equipped weapon
   */
  private removeEquippedWeapon(): void {
    if (this.swordMesh) {
      const rightArm = this.mesh.getObjectByName("rightArm") as THREE.Mesh;
      if (rightArm) {
        rightArm.remove(this.swordMesh);
      }
      this.swordMesh = null;
    }
  }

  /**
   * Update equipped weapon position based on animation
   */
  private updateEquippedWeapon(): void {
    // This method can be expanded to add special effects or adjust weapon position during animations
  }

  /**
   * Reset the knight's animation state
   */
  public resetAnimation(): void {
    const knightData = this.mesh.userData as KnightUserData;
    knightData.animationPhase = 0;
    knightData.isWalking = false;
    knightData.isAttacking = false;
    knightData.attackAnimationPhase = 0;

    if (knightData.limbs) {
      const { leftArm, rightArm, leftLeg, rightLeg } = knightData.limbs;

      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
      if (leftArm) {
        leftArm.rotation.x = 0;
        leftArm.rotation.z = 0;
      }
      if (rightArm) {
        rightArm.rotation.x = 0;
        rightArm.rotation.z = 0;
      }
    }
  }
}
