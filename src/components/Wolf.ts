import * as THREE from "three";
import { WolfUserData } from "../models/types";

export class Wolf {
  public mesh: THREE.Group;
  private healthBarSprite: THREE.Sprite;
  private healthBarMaterial: THREE.SpriteMaterial;
  private damageText: THREE.Sprite;
  private damageTextMaterial: THREE.SpriteMaterial;
  private initialPosition: THREE.Vector3;
  private respawnDelay: number = 8000; // 8 seconds (5 seconds dead + 3 seconds for respawn)

  constructor() {
    this.mesh = this.createWolf();
    this.initialPosition = new THREE.Vector3(10, 0, 10);

    // Create health bar sprite
    this.healthBarMaterial = this.createHealthBarMaterial(100, 100); // 100% health
    this.healthBarSprite = new THREE.Sprite(this.healthBarMaterial);
    this.healthBarSprite.scale.set(2, 0.3, 1);
    this.healthBarSprite.position.set(0, 2.2, 0);
    this.healthBarSprite.visible = false;
    this.mesh.add(this.healthBarSprite);

    // Create damage text sprite
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 128;

    if (context) {
      context.font = "Bold 36px Arial";
      context.fillStyle = "rgba(255, 0, 0, 0.9)";
      context.strokeStyle = "rgba(0, 0, 0, 0.8)";
      context.lineWidth = 4;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeText("-20", 64, 64);
      context.fillText("-20", 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.damageTextMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: false,
    });

    this.damageText = new THREE.Sprite(this.damageTextMaterial);
    this.damageText.scale.set(0.5, 0.5, 0.5);
    this.damageText.position.set(0, 2.5, 0);
    this.damageText.visible = false;
    this.mesh.add(this.damageText);
  }

  /**
   * Create a canvas-based health bar material
   */
  private createHealthBarMaterial(
    current: number,
    max: number,
  ): THREE.SpriteMaterial {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 100;
    canvas.height = 20;

    if (context) {
      // Calculate health percentage
      const healthPercent = current / max;

      // Draw background
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      context.fillRect(0, 0, 100, 20);

      // Determine color based on health percentage
      let fillColor;
      if (healthPercent > 0.6) {
        fillColor = "#00ff00"; // Green for high health
      } else if (healthPercent > 0.3) {
        fillColor = "#ffff00"; // Yellow for medium health
      } else {
        fillColor = "#ff0000"; // Red for low health
      }

      // Draw health bar fill
      context.fillStyle = fillColor;
      context.fillRect(2, 2, Math.max(0, 96 * healthPercent), 16);

      // Draw border
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.strokeRect(1, 1, 98, 18);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: true,
    });
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
    frontLeftLeg.name = "frontLeftLeg";
    wolfGroup.add(frontLeftLeg);

    const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontRightLeg.position.set(-0.5, 0, 0.7);
    frontRightLeg.name = "frontRightLeg";
    wolfGroup.add(frontRightLeg);

    // Back legs
    const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    backLeftLeg.position.set(0.5, 0, -0.7);
    backLeftLeg.name = "backLeftLeg";
    wolfGroup.add(backLeftLeg);

    const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    backRightLeg.position.set(-0.5, 0, -0.7);
    backRightLeg.name = "backRightLeg";
    wolfGroup.add(backRightLeg);

    // Wolf tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.7, -1.2);
    tail.rotation.x = Math.PI / 4; // Angle up
    tail.name = "tail";
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
      emissiveIntensity: 0.5,
    });
    const followIndicator = new THREE.Mesh(
      indicatorGeometry,
      indicatorMaterial,
    );
    followIndicator.position.set(0, 1.8, 0);
    followIndicator.visible = false; // Initially invisible
    followIndicator.name = "followIndicator";
    wolfGroup.add(followIndicator);

    // Initialize wolf data
    wolfGroup.userData = {
      velocity: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(),
      speed: 0.05,
      changeDirectionTime: 0,
      legAnimationPhase: 0,
      isFollowing: false,
      maxHealth: 100,
      currentHealth: 100,
      lastDamageTime: 0,
      isShowingDamage: false,
      isDead: false,
      deathTime: 0,
      deathAnimationPhase: 0,
    } as WolfUserData;

    // Position the wolf
    wolfGroup.position.set(10, 0, 10);

    return wolfGroup;
  }

  /**
   * Update wolf behavior and animations
   */
  public update(playerPosition: THREE.Vector3, currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Handle death animation and respawn
    if (wolfData.isDead) {
      this.updateDeathAnimation(currentTime);
      return; // Skip normal updates if dead
    }

    // Calculate distance to player
    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    const followDistance = 15; // Distance at which wolf starts following player
    const minDistance = 3; // Minimum distance wolf keeps from player

    // Get reference to follow indicator
    const followIndicator = this.mesh.getObjectByName(
      "followIndicator",
    ) as THREE.Mesh;

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
        wolfData.changeDirectionTime =
          currentTime + 3000 + Math.random() * 5000;
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
    const frontLeftLeg = this.mesh.getObjectByName(
      "frontLeftLeg",
    ) as THREE.Mesh;
    const frontRightLeg = this.mesh.getObjectByName(
      "frontRightLeg",
    ) as THREE.Mesh;
    const backLeftLeg = this.mesh.getObjectByName("backLeftLeg") as THREE.Mesh;
    const backRightLeg = this.mesh.getObjectByName(
      "backRightLeg",
    ) as THREE.Mesh;

    // Diagonal pairs move together (front-left with back-right, front-right with back-left)
    if (frontLeftLeg && backRightLeg && frontRightLeg && backLeftLeg) {
      frontLeftLeg.rotation.x = Math.sin(wolfData.legAnimationPhase) * 0.3;
      backRightLeg.rotation.x = Math.sin(wolfData.legAnimationPhase) * 0.3;
      frontRightLeg.rotation.x =
        Math.sin(wolfData.legAnimationPhase + Math.PI) * 0.3;
      backLeftLeg.rotation.x =
        Math.sin(wolfData.legAnimationPhase + Math.PI) * 0.3;
    }

    // Animate tail wagging - wag faster when following player
    const tail = this.mesh.getObjectByName("tail") as THREE.Mesh;
    if (tail) {
      const wagSpeed = wolfData.isFollowing ? 3 : 2;
      tail.rotation.z = Math.sin(wolfData.legAnimationPhase * wagSpeed) * 0.2;
    }

    // Pulse the follow indicator when active
    if (followIndicator && followIndicator.visible) {
      followIndicator.scale.setScalar(
        0.8 + Math.sin(currentTime * 0.005) * 0.2,
      );
    }

    // Update health bar
    this.updateHealthBar();

    // Update damage text animation
    if (wolfData.isShowingDamage) {
      const damageElapsed = currentTime - wolfData.lastDamageTime;

      // Move damage text upward
      this.damageText.position.y = 2.5 + damageElapsed * 0.002;

      // Fade out damage text
      const opacity = 1 - damageElapsed / 1000;
      if (opacity > 0) {
        this.damageTextMaterial.opacity = opacity;
      } else {
        // Hide damage text after animation completes
        this.damageText.visible = false;
        wolfData.isShowingDamage = false;
      }
    }
  }

  /**
   * Update death animation
   */
  private updateDeathAnimation(currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;
    const timeSinceDeath = currentTime - wolfData.deathTime;

    // Death animation phase (0-1 seconds): Wolf collapses to the ground
    if (timeSinceDeath < 1000) {
      const collapseProgress = Math.min(1, timeSinceDeath / 1000);

      // Rotate the wolf to fall on its side
      this.mesh.rotation.z = (collapseProgress * Math.PI) / 2;

      // Lower the wolf's body
      const body = this.mesh.children.find(
        (child) =>
          child instanceof THREE.Mesh &&
          (child.geometry as THREE.BoxGeometry).parameters.width === 1.5,
      );

      if (body) {
        body.position.y = 0.5 * (1 - collapseProgress);
      }
    }

    // Disappear phase (5-6 seconds): Wolf fades out
    if (timeSinceDeath > 5000 && timeSinceDeath < 6000) {
      const fadeOutProgress = (timeSinceDeath - 5000) / 1000;

      // Make all wolf parts transparent
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.Material;
          if (material.transparent !== undefined) {
            material.transparent = true;
            material.opacity = 1 - fadeOutProgress;
            material.needsUpdate = true;
          }
        }
      });
    }

    // Respawn phase (after 8 seconds): Spawn a new wolf
    if (timeSinceDeath > this.respawnDelay) {
      this.respawn();
    }
  }

  /**
   * Respawn the wolf
   */
  private respawn(): void {
    // Reset wolf position to a new random location
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = 15 + Math.random() * 10; // Between 15-25 units away
    const newX = Math.cos(randomAngle) * randomDistance;
    const newZ = Math.sin(randomAngle) * randomDistance;

    this.mesh.position.set(newX, 0, newZ);
    this.mesh.rotation.set(0, 0, 0);

    // Reset all mesh materials to be fully opaque
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;
        if (material.opacity !== undefined) {
          material.opacity = 1;
          material.transparent = false;
          material.needsUpdate = true;
        }
      }
    });

    // Reset body position if it was moved
    const body = this.mesh.children.find(
      (child) =>
        child instanceof THREE.Mesh &&
        (child.geometry as THREE.BoxGeometry).parameters.width === 1.5,
    );

    if (body) {
      body.position.y = 0.5;
    }

    // Reset wolf data
    const wolfData = this.mesh.userData as WolfUserData;
    wolfData.velocity.set(0, 0, 0);
    wolfData.targetPosition.set(newX, 0, newZ);
    wolfData.changeDirectionTime = 0;
    wolfData.isFollowing = false;
    wolfData.currentHealth = wolfData.maxHealth;
    wolfData.isShowingDamage = false;
    wolfData.isDead = false;
    wolfData.deathTime = 0;
    wolfData.deathAnimationPhase = 0;

    // Hide health bar and damage text
    this.healthBarSprite.visible = false;
    this.damageText.visible = false;

    // Hide follow indicator
    const followIndicator = this.mesh.getObjectByName("followIndicator");
    if (followIndicator) {
      followIndicator.visible = false;
    }

    console.log("A new wolf has appeared!");
  }

  /**
   * Update the health bar based on current health
   */
  private updateHealthBar(): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Update health bar material with current health
    this.healthBarMaterial = this.createHealthBarMaterial(
      wolfData.currentHealth,
      wolfData.maxHealth,
    );

    // Apply the new material to the sprite
    this.healthBarSprite.material = this.healthBarMaterial;

    // Show health bar if wolf has taken damage
    if (wolfData.currentHealth < wolfData.maxHealth) {
      this.healthBarSprite.visible = true;
    }
  }

  /**
   * Apply damage to the wolf
   */
  public takeDamage(amount: number, currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Skip if already dead
    if (wolfData.isDead) return;

    // Reduce health
    wolfData.currentHealth = Math.max(0, wolfData.currentHealth - amount);

    // Show health bar
    this.healthBarSprite.visible = true;

    // Update health bar
    this.updateHealthBar();

    // Update damage text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 128;

    if (context) {
      context.font = "Bold 36px Arial";
      context.fillStyle = "rgba(255, 0, 0, 0.9)";
      context.strokeStyle = "rgba(0, 0, 0, 0.8)";
      context.lineWidth = 4;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeText(`-${amount}`, 64, 64);
      context.fillText(`-${amount}`, 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.damageTextMaterial.map = texture;
    this.damageTextMaterial.needsUpdate = true;

    // Show damage text
    this.damageText.visible = true;
    this.damageText.position.y = 2.5;
    this.damageTextMaterial.opacity = 1;

    // Set damage animation state
    wolfData.lastDamageTime = currentTime;
    wolfData.isShowingDamage = true;

    // Check if wolf is dead
    if (wolfData.currentHealth <= 0 && !wolfData.isDead) {
      this.die(currentTime);
    }
  }

  /**
   * Start death sequence
   */
  private die(currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;
    wolfData.isDead = true;
    wolfData.deathTime = currentTime;

    // Hide health bar and damage text
    this.healthBarSprite.visible = false;
    this.damageText.visible = false;

    // Hide follow indicator
    const followIndicator = this.mesh.getObjectByName("followIndicator");
    if (followIndicator) {
      followIndicator.visible = false;
    }

    console.log("Wolf has been defeated!");
  }

  /**
   * Check if the wolf is dead
   */
  public isDead(): boolean {
    const wolfData = this.mesh.userData as WolfUserData;
    return wolfData.isDead || wolfData.currentHealth <= 0;
  }

  /**
   * Reset the wolf's position and state
   */
  public reset(): void {
    // Reset position
    this.mesh.position.copy(this.initialPosition);
    this.mesh.rotation.set(0, 0, 0);

    // Reset all mesh materials to be fully opaque
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;
        if (material.opacity !== undefined) {
          material.opacity = 1;
          material.transparent = false;
          material.needsUpdate = true;
        }
      }
    });

    // Reset body position if it was moved
    const body = this.mesh.children.find(
      (child) =>
        child instanceof THREE.Mesh &&
        (child.geometry as THREE.BoxGeometry).parameters.width === 1.5,
    );

    if (body) {
      body.position.y = 0.5;
    }

    // Reset wolf data
    const wolfData = this.mesh.userData as WolfUserData;
    wolfData.velocity.set(0, 0, 0);
    wolfData.targetPosition.copy(this.initialPosition);
    wolfData.changeDirectionTime = 0;
    wolfData.isFollowing = false;
    wolfData.currentHealth = wolfData.maxHealth;
    wolfData.isShowingDamage = false;
    wolfData.isDead = false;
    wolfData.deathTime = 0;
    wolfData.deathAnimationPhase = 0;

    // Hide health bar and damage text
    this.healthBarSprite.visible = false;
    this.damageText.visible = false;

    // Hide follow indicator
    const followIndicator = this.mesh.getObjectByName("followIndicator");
    if (followIndicator) {
      followIndicator.visible = false;
    }
  }
}
