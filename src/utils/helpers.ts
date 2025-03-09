import * as THREE from 'three';

/**
 * Creates a simple UI element
 */
export function createUIElement(
  type: string,
  options: {
    text?: string;
    position?: { top?: string; right?: string; bottom?: string; left?: string };
    styles?: Record<string, string>;
    parent?: HTMLElement;
  }
): HTMLElement {
  const element = document.createElement(type);
  
  if (options.text) {
    element.textContent = options.text;
  }
  
  element.style.position = 'absolute';
  
  if (options.position) {
    if (options.position.top) element.style.top = options.position.top;
    if (options.position.right) element.style.right = options.position.right;
    if (options.position.bottom) element.style.bottom = options.position.bottom;
    if (options.position.left) element.style.left = options.position.left;
  }
  
  if (options.styles) {
    Object.entries(options.styles).forEach(([key, value]) => {
      (element.style as any)[key] = value;
    });
  }
  
  const parent = options.parent || document.body;
  parent.appendChild(element);
  
  return element;
}

/**
 * Lerps between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generates a random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Converts degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Converts radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * 180 / Math.PI;
} 