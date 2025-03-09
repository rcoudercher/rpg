import { KeyBindings, KeyBindingAction } from '../models/types';

export class KeyBindingManager {
  private static readonly STORAGE_KEY = 'wow_game_key_bindings';
  private keyBindings: KeyBindings;
  private defaultBindings: KeyBindings;
  private actions: KeyBindingAction[];
  
  constructor() {
    // Define default key bindings
    this.defaultBindings = {
      moveForward: 'w',
      moveBackward: 's',
      moveLeft: 'a',
      moveRight: 'd',
      interact: 'e',
      toggleInventory: 'i',
      toggleControls: 'c'
    };
    
    // Define actions with labels and descriptions
    this.actions = [
      {
        id: 'moveForward',
        label: 'Move Forward',
        description: 'Move character forward',
        defaultKey: this.defaultBindings.moveForward
      },
      {
        id: 'moveBackward',
        label: 'Move Backward',
        description: 'Move character backward',
        defaultKey: this.defaultBindings.moveBackward
      },
      {
        id: 'moveLeft',
        label: 'Move Left',
        description: 'Strafe character left',
        defaultKey: this.defaultBindings.moveLeft
      },
      {
        id: 'moveRight',
        label: 'Move Right',
        description: 'Strafe character right',
        defaultKey: this.defaultBindings.moveRight
      },
      {
        id: 'interact',
        label: 'Interact',
        description: 'Interact with objects and NPCs',
        defaultKey: this.defaultBindings.interact
      },
      {
        id: 'toggleInventory',
        label: 'Toggle Inventory',
        description: 'Open/close inventory panel',
        defaultKey: this.defaultBindings.toggleInventory
      },
      {
        id: 'toggleControls',
        label: 'Toggle Controls',
        description: 'Show/hide controls guide',
        defaultKey: this.defaultBindings.toggleControls
      }
    ];
    
    // Load saved bindings or use defaults
    this.keyBindings = this.loadBindings();
  }
  
  /**
   * Load key bindings from local storage or use defaults
   */
  private loadBindings(): KeyBindings {
    try {
      const savedBindings = localStorage.getItem(KeyBindingManager.STORAGE_KEY);
      if (savedBindings) {
        const parsedBindings = JSON.parse(savedBindings) as Partial<KeyBindings>;
        // Merge with defaults in case saved bindings are incomplete
        return { ...this.defaultBindings, ...parsedBindings };
      }
    } catch (error) {
      console.error('Error loading key bindings:', error);
    }
    
    return { ...this.defaultBindings };
  }
  
  /**
   * Save key bindings to local storage
   */
  public saveBindings(): void {
    try {
      localStorage.setItem(KeyBindingManager.STORAGE_KEY, JSON.stringify(this.keyBindings));
    } catch (error) {
      console.error('Error saving key bindings:', error);
    }
  }
  
  /**
   * Get current key bindings
   */
  public getBindings(): KeyBindings {
    return { ...this.keyBindings };
  }
  
  /**
   * Get default key bindings
   */
  public getDefaultBindings(): KeyBindings {
    return { ...this.defaultBindings };
  }
  
  /**
   * Get all key binding actions with descriptions
   */
  public getActions(): KeyBindingAction[] {
    return [...this.actions];
  }
  
  /**
   * Update a specific key binding
   */
  public updateBinding(actionId: keyof KeyBindings, key: string): void {
    // Check if this key is already used by another action
    const conflictingAction = Object.entries(this.keyBindings).find(
      ([id, value]) => value === key && id !== actionId
    );
    
    if (conflictingAction) {
      console.warn(`Key '${key}' is already bound to '${conflictingAction[0]}'. Swapping bindings.`);
      // Swap the bindings
      this.keyBindings[conflictingAction[0] as keyof KeyBindings] = this.keyBindings[actionId];
    }
    
    // Update the binding
    this.keyBindings[actionId] = key;
    
    // Save to local storage
    this.saveBindings();
  }
  
  /**
   * Reset all key bindings to defaults
   */
  public resetToDefaults(): void {
    this.keyBindings = { ...this.defaultBindings };
    this.saveBindings();
  }
  
  /**
   * Check if a key is bound to a specific action
   */
  public isKeyBoundToAction(key: string, actionId: keyof KeyBindings): boolean {
    return this.keyBindings[actionId].toLowerCase() === key.toLowerCase();
  }
  
  /**
   * Get the action bound to a specific key
   */
  public getActionForKey(key: string): keyof KeyBindings | null {
    const lowerKey = key.toLowerCase();
    const entry = Object.entries(this.keyBindings).find(
      ([_, value]) => value.toLowerCase() === lowerKey
    );
    
    return entry ? entry[0] as keyof KeyBindings : null;
  }
} 