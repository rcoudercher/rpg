import * as THREE from 'three';
import { WolfUserData } from '../models/types';

export class Wolf {
  public mesh: THREE.Group;
  
  constructor() {
    this.mesh = this.createWolf();
  }
  
  private createWolf(): THREE.Group {
    // Create a wolf group to hold all parts
    const wolfGroup = new THREE.Group();
    
    // Wolf body (main body)
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 }); // Gray color
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    wolfGroup.add(body);
    
    // Wolf head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Darker gray
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.9, 1.0); // Position at front of body
    wolfGroup.add(head);
    
    // Wolf snout
    const snoutGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.6);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 }); // Even darker
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 0.7, 1.6); // Extend from head
    wolfGroup.add(snout);
    
    // Wolf ears (2 triangular prisms)
    const earGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
    const earMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(0.3, 1.3, 1.0);
    leftEar.rotation.x = -Math.PI / 6; // Tilt forward slightly
    wolfGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(-0.3, 1.3, 1.0);
    rightEar.rotation.x = -Math.PI / 6; // Tilt forward slightly
    wolfGroup.add(rightEar);
    
    // Wolf legs (4 legs)
    const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    
    // Front legs
    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(0.5, 0, 0.7);
    frontLeftLeg.name = 'frontLeftLeg';
    wolfGroup.add(frontLeftLeg);
    
    const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontRightLeg.position.set(-0.5, 0, 0.7);
    frontRightLeg.name = 'frontRightLeg';
    wolfGroup.add(frontRightLeg);
    
    // Back legs
    const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    backLeftLeg.position.set(0.5, 0, -0.7);
    backLeftLeg.name = 'backLeftLeg';
    wolfGroup.add(backLeftLeg);
    
    const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    backRightLeg.position.set(-0.5, 0, -0.7);
    backRightLeg.name = 'backRightLeg';
    wolfGroup.add(backRightLeg);
    
    // Wolf tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.7, -1.2);
    tail.rotation.x = Math.PI / 4; // Angle up
    tail.name = 'tail';
    wolfGroup.add(tail);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red eyes
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.2, 0.9, 1.35);
    wolfGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.2, 0.9, 1.35);
    wolfGroup.add(rightEye);
    
    // Add a visual indicator for when wolf is following (initially invisible)
    const indicatorGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const indicatorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const followIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    followIndicator.position.set(0, 1.8, 0);
    followIndicator.visible = false; // Initially invisible
    followIndicator.name = 'followIndicator';
    wolfGroup.add(followIndicator);
    
    // Position the wolf
    wolfGroup.position.set(10, 0, 0);
    
    // Add wandering properties
    wolfGroup.userData = {
      velocity: new THREE.Vector3(0, 0, 0),
      targetPosition: new THREE.Vector3(10, 0, 0),
      speed: 0.03,
      changeDirectionTime: 0,
      legAnimationPhase: 0,
      isFollowing: false
    } as WolfUserData;
    
    return wolfGroup;
  }
  
  /**
   * Update wolf movement and animation
   */
  public update(playerPosition: THREE.Vector3, currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;
    
    // Calculate distance to player
    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    const followDistance = 15; // Distance at which wolf starts following player
    const minDistance = 3; // Minimum distance wolf keeps from player
    
    // Get reference to follow indicator
    const followIndicator = this.mesh.getObjectByName('followIndicator') as THREE.Mesh;
    
    // Determine if wolf should follow player or wander
    if (distanceToPlayer < followDistance) {
      // Follow player behavior
      
      // Show follow indicator
      if (followIndicator) {
        followIndicator.visible = true;
      }
      wolfData.isFollowing = true;
      
      // Calculate direction to player, but maintain minimum distance
      if (distanceToPlayer > minDistance) {
        const direction = new THREE.Vector3()
          .subVectors(playerPosition, this.mesh.position)
          .normalize();
        
        // Set velocity based on direction and speed
        // Wolf moves faster when following player
        const followSpeed = 0.05; // Faster than wandering speed
        wolfData.velocity.copy(direction).multiplyScalar(followSpeed);
        
        // Rotate wolf to face direction of movement
        if (direction.length() > 0.1) {
          const angle = Math.atan2(direction.x, direction.z);
          this.mesh.rotation.y = angle;
        }
      } else {
        // If too close to player, stop moving
        wolfData.velocity.set(0, 0, 0);
      }
      
      // Reset the change direction timer so it picks a new random direction
      // when it stops following the player
      wolfData.changeDirectionTime = currentTime + 1000;
    } else {
      // Random wandering behavior (when not following player)
      
      // Hide follow indicator
      if (followIndicator) {
        followIndicator.visible = false;
      }
      wolfData.isFollowing = false;
      
      if (currentTime > wolfData.changeDirectionTime) {
        // Set a new random target within bounds of the map
        const randomX = Math.random() * 40 - 20; // -20 to 20
        const randomZ = Math.random() * 40 - 20; // -20 to 20
        wolfData.targetPosition.set(randomX, 0, randomZ);
        
        // Calculate direction to target
        const direction = new THREE.Vector3()
          .subVectors(wolfData.targetPosition, this.mesh.position)
          .normalize();
        
        // Set velocity based on direction and speed
        wolfData.velocity.copy(direction).multiplyScalar(wolfData.speed);
        
        // Rotate wolf to face direction of movement
        if (direction.length() > 0.1) {
          const angle = Math.atan2(direction.x, direction.z);
          this.mesh.rotation.y = angle;
        }
        
        // Set next direction change in 3-8 seconds
        wolfData.changeDirectionTime = currentTime + 3000 + Math.random() * 5000;
      }
    }
    
    // Move wolf based on current velocity
    this.mesh.position.add(wolfData.velocity);
    
    // Keep wolf within bounds
    if (this.mesh.position.x < -24) this.mesh.position.x = -24;
    if (this.mesh.position.x > 24) this.mesh.position.x = 24;
    if (this.mesh.position.z < -24) this.mesh.position.z = -24;
    if (this.mesh.position.z > 24) this.mesh.position.z = 24;
    
    // Animate legs for walking
    const isMoving = wolfData.velocity.lengthSq() > 0.0001;
    const walkingSpeed = isMoving ? 0.1 : 0;
    
    wolfData.legAnimationPhase += walkingSpeed;
    
    // Get references to the legs
    const frontLeftLeg = this.mesh.getObjectByName('frontLeftLeg') as THREE.Mesh;
    const frontRightLeg = this.mesh.getObjectByName('frontRightLeg') as THREE.Mesh;
    const backLeftLeg = this.mesh.getObjectByName('backLeftLeg') as THREE.Mesh;
    const backRightLeg = this.mesh.getObjectByName('backRightLeg') as THREE.Mesh;
    
    // Diagonal pairs move together (front-left with back-right, front-right with back-left)
    if (frontLeftLeg && backRightLeg && frontRightLeg && backLeftLeg) {
      frontLeftLeg.rotation.x = Math.sin(wolfData.legAnimationPhase) * 0.3;
      backRightLeg.rotation.x = Math.sin(wolfData.legAnimationPhase) * 0.3;
      frontRightLeg.rotation.x = Math.sin(wolfData.legAnimationPhase + Math.PI) * 0.3;
      backLeftLeg.rotation.x = Math.sin(wolfData.legAnimationPhase + Math.PI) * 0.3;
    }
    
    // Animate tail wagging - wag faster when following player
    const tail = this.mesh.getObjectByName('tail') as THREE.Mesh;
    if (tail) {
      const wagSpeed = wolfData.isFollowing ? 3 : 2;
      tail.rotation.z = Math.sin(wolfData.legAnimationPhase * wagSpeed) * 0.2;
    }
    
    // Pulse the follow indicator when active
    if (followIndicator && followIndicator.visible) {
      followIndicator.scale.setScalar(0.8 + Math.sin(currentTime * 0.005) * 0.2);
    }
  }
  
  /**
   * Reset the wolf to its initial state
   */
  public reset(): void {
    this.mesh.position.set(10, 0, 0);
    this.mesh.rotation.y = 0;
    
    const wolfData = this.mesh.userData as WolfUserData;
    wolfData.velocity.set(0, 0, 0);
    wolfData.targetPosition.set(10, 0, 0);
    wolfData.changeDirectionTime = 0;
    wolfData.isFollowing = false;
    
    // Hide follow indicator
    const followIndicator = this.mesh.getObjectByName('followIndicator') as THREE.Mesh;
    if (followIndicator) {
      followIndicator.visible = false;
    }
  }
} 