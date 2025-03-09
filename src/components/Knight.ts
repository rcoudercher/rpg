import * as THREE from 'three';
import { KnightUserData } from '../models/types';

export class Knight {
  public mesh: THREE.Group;
  
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
      roughness: 0.3
    });
    const torso = new THREE.Mesh(torsoGeometry, armorMaterial);
    torso.position.y = 1.0;
    knightGroup.add(torso);
    
    // Knight head (red hair instead of helmet)
    const headGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffcca8, // Skin tone
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.8;
    knightGroup.add(head);
    
    // Red hair (wild, spiky style)
    const hairGroup = new THREE.Group();
    const hairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff3300, // Bright red hair
      roughness: 0.9,
      metalness: 0.1
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
        Math.cos(angle) * radius
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
      roughness: 0.7
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
      metalness: 0.2
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
      metalness: 0.2
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
      roughness: 0.9
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
    leftArm.name = 'leftArm'; // Add name for easier identification
    knightGroup.add(leftArm);
    
    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armorMaterial);
    rightArm.position.set(-0.55, 1.0, 0);
    rightArm.name = 'rightArm'; // Add name for easier identification
    knightGroup.add(rightArm);
    
    // Knight legs
    const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    
    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, armorMaterial);
    leftLeg.position.set(0.25, 0.4, 0);
    leftLeg.name = 'leftLeg'; // Add name for easier identification
    knightGroup.add(leftLeg);
    
    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, armorMaterial);
    rightLeg.position.set(-0.25, 0.4, 0);
    rightLeg.name = 'rightLeg'; // Add name for easier identification
    knightGroup.add(rightLeg);
    
    // Knight shield
    const shieldGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.5);
    const shieldMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0000aa, // Blue shield
      metalness: 0.3,
      roughness: 0.7
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.set(-0.7, 1.0, 0.1);
    knightGroup.add(shield);
    
    // Add animation properties
    knightGroup.userData = {
      animationPhase: 0,
      isWalking: false
    } as KnightUserData;
    
    // Position the knight
    knightGroup.position.set(0, 0, 0);
    
    return knightGroup;
  }
  
  /**
   * Animate the knight based on movement
   */
  public animate(isMoving: boolean): void {
    const knightData = this.mesh.userData as KnightUserData;
    
    // Update animation phase
    if (isMoving) {
      knightData.animationPhase += 0.15;
      knightData.isWalking = true;
    } else {
      // Gradually return to standing position
      if (knightData.isWalking) {
        knightData.animationPhase = 0;
        knightData.isWalking = false;
      }
    }
    
    // Store references to limbs in userData to avoid index issues
    if (!knightData.limbs) {
      // Find limbs by name
      const leftArm = this.mesh.getObjectByName('leftArm') as THREE.Mesh;
      const rightArm = this.mesh.getObjectByName('rightArm') as THREE.Mesh;
      const leftLeg = this.mesh.getObjectByName('leftLeg') as THREE.Mesh;
      const rightLeg = this.mesh.getObjectByName('rightLeg') as THREE.Mesh;
      
      // Store references
      knightData.limbs = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg
      };
    }
    
    const { leftArm, rightArm, leftLeg, rightLeg } = knightData.limbs;
    
    // Only animate if we found all limbs
    if (leftLeg && rightLeg && leftArm && rightArm) {
      if (isMoving) {
        // Animate legs for walking
        leftLeg.rotation.x = Math.sin(knightData.animationPhase) * 0.5;
        rightLeg.rotation.x = Math.sin(knightData.animationPhase + Math.PI) * 0.5;
        
        // Animate arms for walking
        leftArm.rotation.x = Math.sin(knightData.animationPhase + Math.PI) * 0.3;
        rightArm.rotation.x = Math.sin(knightData.animationPhase) * 0.3;
      } else {
        // Reset to standing position
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
      }
    }
  }
  
  /**
   * Reset the knight's animation state
   */
  public resetAnimation(): void {
    const knightData = this.mesh.userData as KnightUserData;
    
    if (knightData.limbs) {
      const { leftLeg, rightLeg, leftArm, rightArm } = knightData.limbs;
      
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
      if (leftArm) leftArm.rotation.x = 0;
      if (rightArm) rightArm.rotation.x = 0;
    }
    
    knightData.animationPhase = 0;
    knightData.isWalking = false;
  }
} 