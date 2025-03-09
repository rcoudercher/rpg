import * as THREE from "three";
import { WolfUserData } from "../models/types";

export class Wolf {
  public mesh: THREE.Group;
  private healthBarSprite: THREE.Sprite;
  private healthBarMaterial: THREE.SpriteMaterial;
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
  public update(
    playerPosition: THREE.Vector3,
    currentTime: number,
    knight: any,
  ): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Handle death animation and respawn
    if (wolfData.isDead) {
      this.updateDeathAnimation(currentTime);
      return; // Skip normal updates if dead
    }

    // Calculate distance to player
    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    const followDistance = 15; // Distance at which wolf starts following player
    const minDistance = 2; // Minimum distance wolf keeps from player
    const attackDistance = 2.5; // Distance at which wolf can attack player

    // Determine if wolf should follow player or wander
    if (distanceToPlayer < followDistance) {
      // Follow player behavior
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

        // Attack player if close enough
        if (distanceToPlayer < attackDistance) {
          this.attackPlayer(knight, currentTime);
        }
      }

      // Reset the change direction timer so it picks a new random direction
      // when it stops following the player
      wolfData.changeDirectionTime = currentTime + 1000;
    } else {
      // Random wandering behavior (when not following player)
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

        // Set a new change direction time (2-5 seconds)
        wolfData.changeDirectionTime =
          currentTime + 2000 + Math.random() * 3000;
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

    // Update health bar
    this.updateHealthBar();
  }

  /**
   * Update death animation
   */
  private updateDeathAnimation(currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Make sure deathTime is set and valid
    if (!wolfData.deathTime || wolfData.deathTime > currentTime) {
      console.log("Invalid death time detected, resetting to current time");
      wolfData.deathTime = currentTime;
    }

    const timeSinceDeath = currentTime - wolfData.deathTime;

    // Safety check for negative time (should never happen)
    if (timeSinceDeath < 0) {
      console.error("Negative time since death detected:", timeSinceDeath);
      console.log(
        "Current time:",
        currentTime,
        "Death time:",
        wolfData.deathTime,
      );
      // Force respawn to fix the issue
      this.respawn();
      return;
    }

    console.log(
      `Wolf death animation: ${Math.round(timeSinceDeath)}ms since death`,
    );

    // Death animation phase (0-1 seconds): Wolf collapses to the ground
    if (timeSinceDeath < 1000) {
      const collapseProgress = Math.min(1, timeSinceDeath / 1000);
      // Rotate the wolf to fall on its side
      this.mesh.rotation.z = (collapseProgress * Math.PI) / 2;
    }
    // Disappear phase (2-3 seconds): Wolf fades out
    else if (timeSinceDeath > 2000 && timeSinceDeath < 3000) {
      const fadeOutProgress = (timeSinceDeath - 2000) / 1000;

      // Make all wolf parts transparent
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          material.transparent = true;
          material.opacity = 1 - fadeOutProgress;
          material.needsUpdate = true;
        }
      });
    }
    // Respawn phase (after 4 seconds): Spawn a new wolf
    else if (timeSinceDeath > 4000) {
      console.log("Respawning wolf after death animation");
      this.respawn();
    }
  }

  /**
   * Respawn the wolf
   */
  private respawn(): void {
    console.log("Wolf respawn function called");

    // Generate a new random position
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = 15 + Math.random() * 10; // Between 15-25 units away
    const newX = Math.cos(randomAngle) * randomDistance;
    const newZ = Math.sin(randomAngle) * randomDistance;

    // Set new position
    this.mesh.position.set(newX, 0, newZ);

    // Reset all wolf properties
    this.reset();

    console.log("Wolf respawned at position:", this.mesh.position);
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
   * Take damage and update health
   */
  public takeDamage(amount: number, currentTime: number): void {
    const wolfData = this.mesh.userData as WolfUserData;

    // Skip if already dead
    if (wolfData.isDead) {
      return;
    }

    // Reduce health
    wolfData.currentHealth = Math.max(0, wolfData.currentHealth - amount);

    // Show health bar
    this.healthBarSprite.visible = true;

    // Update health bar
    this.updateHealthBar();

    // Create a floating damage text in the world
    this.createDamageText(amount);

    // Check if wolf is dead
    if (wolfData.currentHealth <= 0) {
      console.log("Wolf health reached zero, triggering death");
      this.die(currentTime);
    }
  }

  /**
   * Create a floating damage text
   */
  private createDamageText(amount: number): void {
    // Create a div element for the damage text
    const damageText = document.createElement("div");
    damageText.textContent = `-${amount}`;
    damageText.style.position = "absolute";
    damageText.style.color = "#FF0000"; // Bright red
    damageText.style.fontWeight = "bold";
    damageText.style.fontSize = "48px"; // Even larger text
    damageText.style.fontFamily = "Arial, sans-serif";
    damageText.style.textShadow = "3px 3px 5px black"; // Stronger shadow
    damageText.style.zIndex = "1000";
    damageText.style.pointerEvents = "none"; // Don't block clicks
    damageText.style.userSelect = "none"; // Prevent text selection
    damageText.style.transform = "translate(-50%, -50%)"; // Center the text

    // Add to document
    document.body.appendChild(damageText);

    // Initial position
    this.updateDamageTextPosition(damageText, 2);

    // Animate the damage text
    let opacity = 1;
    let offsetY = 0; // Offset from the wolf's position
    let scale = 1.0;

    const animate = () => {
      // Update position to follow wolf with increasing height
      offsetY += 0.05; // Gradually move upward relative to wolf
      this.updateDamageTextPosition(damageText, 2 + offsetY);

      // Scale up slightly
      scale += 0.01;
      damageText.style.transform = `translate(-50%, -50%) scale(${scale})`;

      // Fade out
      opacity -= 0.015;
      damageText.style.opacity = opacity.toString();

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        // Remove from DOM when animation is complete
        document.body.removeChild(damageText);
      }
    };

    // Start animation
    requestAnimationFrame(animate);
  }

  /**
   * Update the position of a damage text element to follow the wolf
   */
  private updateDamageTextPosition(
    element: HTMLElement,
    heightOffset: number,
  ): void {
    // Get wolf position in screen coordinates
    const worldPos = this.mesh.position.clone();
    worldPos.y += heightOffset; // Position above the wolf

    // Convert to screen coordinates using the camera
    const tempV = worldPos.clone();
    tempV.project(window.gameInstance.camera);

    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;

    // Position the damage text
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  /**
   * Start death sequence
   */
  private die(currentTime: number): void {
    console.log("Wolf die method called at time:", currentTime);

    // Validate current time
    if (!currentTime || currentTime <= 0) {
      console.error("Invalid current time in die method:", currentTime);
      currentTime = Date.now(); // Use Date.now() as fallback
      console.log("Using fallback time:", currentTime);
    }

    const wolfData = this.mesh.userData as WolfUserData;

    // Skip if already dead
    if (wolfData.isDead) {
      console.log("Wolf is already dead, skipping die method");
      return;
    }

    wolfData.isDead = true;
    wolfData.deathTime = currentTime;
    wolfData.deathAnimationPhase = 0;

    console.log("Set wolf death time to:", wolfData.deathTime);

    // Hide health bar
    this.healthBarSprite.visible = false;

    // Generate a random amount of gold between 1 and 10
    const goldAmount = Math.floor(Math.random() * 10) + 1;

    // Dispatch an event to notify the game that the wolf has died and should drop gold
    const goldDropEvent = new CustomEvent("wolfDeath", {
      detail: {
        position: this.mesh.position.clone(),
        goldAmount: goldAmount,
      },
    });
    document.dispatchEvent(goldDropEvent);

    console.log(
      `Wolf has been defeated! Dropped ${goldAmount} gold. Will respawn in 4 seconds.`,
    );
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
    console.log("Resetting wolf state");

    // Reset rotation
    this.mesh.rotation.set(0, 0, 0);

    // Reset all mesh materials to be fully opaque
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        material.transparent = false;
        material.opacity = 1;
        material.needsUpdate = true;
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
    wolfData.velocity = new THREE.Vector3(0, 0, 0);
    wolfData.targetPosition = new THREE.Vector3(
      this.mesh.position.x,
      0,
      this.mesh.position.z,
    );
    wolfData.changeDirectionTime = 0;
    wolfData.isFollowing = false;
    wolfData.currentHealth = wolfData.maxHealth;
    wolfData.isShowingDamage = false;
    wolfData.isDead = false;
    wolfData.deathTime = 0;
    wolfData.deathAnimationPhase = 0;

    // Update health bar
    this.updateHealthBar();
    this.healthBarSprite.visible = false;

    console.log("Wolf reset complete");
  }

  /**
   * Attack the player
   */
  private attackPlayer(knight: any, currentTime: number): void {
    // Check if enough time has passed since last attack (attack every 1.5 seconds)
    const wolfData = this.mesh.userData as WolfUserData;
    const attackCooldown = 1500; // 1.5 seconds

    if (
      !wolfData.lastAttackTime ||
      currentTime - wolfData.lastAttackTime > attackCooldown
    ) {
      // Deal damage to player
      const damage = 10; // Wolf deals 10 damage per attack
      knight.takeDamage(damage, currentTime);

      // Set last attack time
      wolfData.lastAttackTime = currentTime;

      // Perform attack animation
      this.performAttackAnimation();
    }
  }

  /**
   * Perform attack animation
   */
  private performAttackAnimation(): void {
    // Simple attack animation - wolf jumps forward slightly
    const originalPosition = this.mesh.position.clone();
    const forward = new THREE.Vector3(
      -Math.sin(this.mesh.rotation.y),
      0,
      -Math.cos(this.mesh.rotation.y),
    );

    // Jump forward
    this.mesh.position.add(forward.multiplyScalar(0.3));

    // Return to original position after a short delay
    setTimeout(() => {
      this.mesh.position.copy(originalPosition);
    }, 200);
  }
}
