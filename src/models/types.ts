import * as THREE from "three";

// Game state types
export interface PlayerState {
  x: number;
  y: number;
  z: number;
  inventory: string[];
  gold?: number;
}

export interface EnemyState {
  type: string;
  x: number;
  y: number;
  z: number;
}

export interface ItemState {
  type: string;
  x: number;
  y: number;
  z: number;
  amount?: number;
}

export interface GameState {
  player: PlayerState;
  enemies: EnemyState[];
  items: ItemState[];
}

// Character types
export interface KnightUserData {
  animationPhase: number;
  isWalking: boolean;
  isAttacking: boolean;
  attackAnimationPhase: number;
  equippedWeapon: string | null;
  maxHealth: number;
  currentHealth: number;
  lastDamageTime: number;
  isShowingDamage: boolean;
  limbs?: {
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
  };
}

export interface WolfUserData {
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  speed: number;
  changeDirectionTime: number;
  legAnimationPhase: number;
  isFollowing: boolean;
  maxHealth: number;
  currentHealth: number;
  lastDamageTime: number;
  isShowingDamage: boolean;
  isDead: boolean;
  deathTime: number;
  deathAnimationPhase: number;
  damageTextMesh?: THREE.Mesh | null;
  lastAttackTime?: number;
}

export interface GoldUserData {
  isGold: boolean;
  amount: number;
}

export interface FlameUserData {
  originalHeight: number;
  phase: number;
  speed: number;
}

export interface LightUserData {
  originalIntensity: number;
  phase: number;
}

export interface CampfireUserData {
  flames: THREE.Mesh[];
  light: THREE.PointLight;
}

// Input types
export interface KeyState {
  [key: string]: boolean;
}

// Key binding types
export interface KeyBindings {
  moveForward: string;
  moveBackward: string;
  moveLeft: string;
  moveRight: string;
  interact: string;
  attack: string;
  toggleInventory: string;
  toggleControls: string;
}

export interface KeyBindingAction {
  id: keyof KeyBindings;
  label: string;
  description: string;
  defaultKey: string;
}
