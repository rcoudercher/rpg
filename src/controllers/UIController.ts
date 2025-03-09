import { createUIElement } from '../utils/helpers';

export class UIController {
  private controlsGuide!: HTMLElement;
  private inventoryPanel!: HTMLElement;
  private inventoryItems!: HTMLElement;
  private wolfStatusIndicator!: HTMLElement;
  private wolfStatusText!: HTMLElement;
  private uiContainer!: HTMLElement;
  private keyBindingsButton!: HTMLElement;
  
  constructor() {
    this.createUI();
  }
  
  /**
   * Create all UI elements
   */
  private createUI(): void {
    // Create a container for all UI elements
    this.createUIContainer();
    
    // Create all UI elements
    this.createControlsGuide();
    this.createInventoryPanel();
    this.createWolfStatusIndicator();
    this.createResetButton();
    this.createKeyBindingsButton();
  }
  
  /**
   * Create a container for all UI elements
   */
  private createUIContainer(): void {
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'fixed';
    this.uiContainer.style.top = '0';
    this.uiContainer.style.left = '0';
    this.uiContainer.style.width = '100%';
    this.uiContainer.style.height = '100%';
    this.uiContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to elements below
    this.uiContainer.style.zIndex = '1000';
    document.body.appendChild(this.uiContainer);
  }
  
  /**
   * Create controls guide
   */
  private createControlsGuide(): void {
    // Add controls guide
    this.controlsGuide = document.createElement('div');
    this.controlsGuide.style.position = 'absolute';
    this.controlsGuide.style.top = '60px'; // Moved down to avoid overlap with the button
    this.controlsGuide.style.left = '20px';
    this.controlsGuide.style.padding = '15px';
    this.controlsGuide.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.controlsGuide.style.color = 'white';
    this.controlsGuide.style.borderRadius = '5px';
    this.controlsGuide.style.fontFamily = 'Arial, sans-serif';
    this.controlsGuide.style.fontSize = '14px';
    this.controlsGuide.style.maxWidth = '250px';
    this.controlsGuide.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    this.controlsGuide.style.pointerEvents = 'auto'; // Make it clickable
    this.controlsGuide.style.zIndex = '1002'; // Ensure it's above the button
    
    // Create controls guide content
    this.controlsGuide.innerHTML = `
      <h3 style="margin-top: 0; color: #ffcc00; text-align: center;">Game Controls</h3>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center;">
        <div style="text-align: right; font-weight: bold;">Movement:</div>
        <div>
          <div>WASD - Camera-relative movement</div>
          <div>Arrow Keys - Fixed directions</div>
        </div>
        
        <div style="text-align: right; font-weight: bold;">Interact:</div>
        <div>Walk near objects</div>
      </div>
    `;
    
    this.uiContainer.appendChild(this.controlsGuide);
    
    // Add a button to toggle controls visibility
    const toggleControlsButton = document.createElement('button');
    toggleControlsButton.textContent = 'Controls';
    toggleControlsButton.style.position = 'absolute';
    toggleControlsButton.style.top = '20px';
    toggleControlsButton.style.left = '20px';
    toggleControlsButton.style.padding = '8px 15px';
    toggleControlsButton.style.backgroundColor = '#555555';
    toggleControlsButton.style.color = 'white';
    toggleControlsButton.style.border = 'none';
    toggleControlsButton.style.borderRadius = '5px';
    toggleControlsButton.style.cursor = 'pointer';
    toggleControlsButton.style.fontWeight = 'bold';
    toggleControlsButton.style.zIndex = '1001';
    toggleControlsButton.style.pointerEvents = 'auto'; // Make it clickable
    
    // Add event listener to toggle controls visibility
    toggleControlsButton.addEventListener('click', () => {
      if (this.controlsGuide.style.display === 'none') {
        this.controlsGuide.style.display = 'block';
        toggleControlsButton.style.backgroundColor = '#555555';
      } else {
        this.controlsGuide.style.display = 'none';
        toggleControlsButton.style.backgroundColor = '#333333';
      }
    });
    
    this.uiContainer.appendChild(toggleControlsButton);
    
    // Initially hide the controls guide
    this.controlsGuide.style.display = 'none';
  }
  
  /**
   * Create inventory panel
   */
  private createInventoryPanel(): void {
    // Add inventory display
    this.inventoryPanel = document.createElement('div');
    this.inventoryPanel.style.position = 'absolute';
    this.inventoryPanel.style.bottom = '20px';
    this.inventoryPanel.style.right = '20px'; // Changed from left to right
    this.inventoryPanel.style.width = '220px';
    this.inventoryPanel.style.padding = '15px';
    this.inventoryPanel.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
    this.inventoryPanel.style.color = 'white';
    this.inventoryPanel.style.borderRadius = '5px';
    this.inventoryPanel.style.fontFamily = 'Arial, sans-serif';
    this.inventoryPanel.style.border = '2px solid #8b4513';
    this.inventoryPanel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    this.inventoryPanel.style.pointerEvents = 'auto'; // Make it clickable
    
    // Inventory title
    const inventoryTitle = document.createElement('div');
    inventoryTitle.textContent = 'INVENTORY';
    inventoryTitle.style.fontWeight = 'bold';
    inventoryTitle.style.fontSize = '18px';
    inventoryTitle.style.marginBottom = '15px';
    inventoryTitle.style.textAlign = 'center';
    inventoryTitle.style.borderBottom = '2px solid #8b4513';
    inventoryTitle.style.paddingBottom = '8px';
    this.inventoryPanel.appendChild(inventoryTitle);
    
    // Inventory items container
    this.inventoryItems = document.createElement('div');
    this.inventoryItems.style.minHeight = '60px';
    this.inventoryItems.style.marginTop = '10px';
    this.inventoryPanel.appendChild(this.inventoryItems);
    
    this.uiContainer.appendChild(this.inventoryPanel);
  }
  
  /**
   * Create wolf status indicator
   */
  private createWolfStatusIndicator(): void {
    // Add wolf status indicator
    this.wolfStatusIndicator = document.createElement('div');
    this.wolfStatusIndicator.style.position = 'absolute';
    this.wolfStatusIndicator.style.top = '80px'; // Increased top margin for better spacing
    this.wolfStatusIndicator.style.right = '20px'; // Aligned with the reset button
    this.wolfStatusIndicator.style.padding = '10px';
    this.wolfStatusIndicator.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
    this.wolfStatusIndicator.style.color = 'white';
    this.wolfStatusIndicator.style.borderRadius = '5px';
    this.wolfStatusIndicator.style.fontFamily = 'Arial, sans-serif';
    this.wolfStatusIndicator.style.display = 'flex';
    this.wolfStatusIndicator.style.alignItems = 'center';
    this.wolfStatusIndicator.style.transition = 'background-color 0.3s';
    this.wolfStatusIndicator.style.pointerEvents = 'auto'; // Make it clickable
    this.wolfStatusIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'; // Add shadow for better visibility
    
    // Wolf icon
    const wolfIcon = document.createElement('span');
    wolfIcon.textContent = '🐺';
    wolfIcon.style.fontSize = '20px';
    wolfIcon.style.marginRight = '10px';
    this.wolfStatusIndicator.appendChild(wolfIcon);
    
    // Wolf status text
    this.wolfStatusText = document.createElement('span');
    this.wolfStatusText.textContent = 'No wolf nearby';
    this.wolfStatusIndicator.appendChild(this.wolfStatusText);
    
    this.uiContainer.appendChild(this.wolfStatusIndicator);
  }
  
  /**
   * Create reset button
   */
  private createResetButton(): void {
    // Create the button element directly
    const button = document.createElement('button');
    button.textContent = 'RESET GAME';
    button.style.position = 'absolute';
    button.style.top = '20px';
    button.style.right = '20px';
    button.style.padding = '12px 24px';
    button.style.backgroundColor = '#ff4444';
    button.style.color = 'white';
    button.style.border = '3px solid white';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '16px';
    button.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.7)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.textTransform = 'uppercase';
    button.style.pointerEvents = 'auto'; // Make it clickable
    
    // Set ID for reference in the Game class
    button.id = 'resetButton';
    
    this.uiContainer.appendChild(button);
  }
  
  /**
   * Create key bindings button
   */
  private createKeyBindingsButton(): void {
    // Create the button element directly
    const button = document.createElement('button');
    button.id = 'key-bindings-button';
    button.textContent = 'KEY BINDINGS';
    button.style.position = 'absolute';
    button.style.bottom = '20px';
    button.style.left = '20px'; // Positioned on the left side
    button.style.padding = '12px 24px';
    button.style.backgroundColor = '#3366cc';
    button.style.color = 'white';
    button.style.border = '3px solid #99ccff';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '16px';
    button.style.boxShadow = '0 0 20px rgba(153, 204, 255, 0.7)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.textTransform = 'uppercase';
    button.style.pointerEvents = 'auto'; // Make it clickable
    button.style.zIndex = '1001'; // Ensure it's above other elements
    
    // Store the button reference
    this.keyBindingsButton = button;
    
    this.uiContainer.appendChild(button);
  }
  
  /**
   * Update inventory display
   */
  public updateInventoryDisplay(playerInventory: string[]): void {
    this.inventoryItems.innerHTML = '';
    
    if (playerInventory.length === 0) {
      const emptyText = document.createElement('div');
      emptyText.textContent = 'Your bag is empty';
      emptyText.style.fontStyle = 'italic';
      emptyText.style.color = '#aaa';
      emptyText.style.textAlign = 'center';
      emptyText.style.marginTop = '10px';
      this.inventoryItems.appendChild(emptyText);
    } else {
      playerInventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.style.padding = '10px';
        itemElement.style.margin = '8px 0';
        itemElement.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        itemElement.style.borderRadius = '5px';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        
        // Item icon
        const itemIcon = document.createElement('div');
        
        if (item === 'sword') {
          itemIcon.textContent = '⚔️';
          itemElement.style.borderLeft = '4px solid #ffcc00';
        }
        
        itemIcon.style.marginRight = '12px';
        itemIcon.style.fontSize = '22px';
        itemIcon.style.width = '30px';
        itemIcon.style.textAlign = 'center';
        
        // Item name
        const itemName = document.createElement('div');
        itemName.textContent = item.charAt(0).toUpperCase() + item.slice(1);
        itemName.style.fontSize = '16px';
        
        itemElement.appendChild(itemIcon);
        itemElement.appendChild(itemName);
        this.inventoryItems.appendChild(itemElement);
      });
    }
  }
  
  /**
   * Update wolf status indicator
   */
  public updateWolfStatus(isNearby: boolean): void {
    if (isNearby) {
      this.wolfStatusText.textContent = 'WOLF NEARBY!';
      this.wolfStatusIndicator.style.backgroundColor = '#ff0000';
      this.wolfStatusIndicator.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
    } else {
      this.wolfStatusText.textContent = 'No wolf nearby';
      this.wolfStatusIndicator.style.backgroundColor = '#444444';
      this.wolfStatusIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    }
  }
  
  /**
   * Get reset button
   */
  public getResetButton(): HTMLElement | null {
    return document.getElementById('resetButton');
  }
  
  /**
   * Get key bindings button
   */
  public getKeyBindingsButton(): HTMLElement {
    return this.keyBindingsButton;
  }
  
  /**
   * Toggle controls guide visibility
   */
  public toggleControlsGuide(): void {
    if (this.controlsGuide.style.display === 'none') {
      this.controlsGuide.style.display = 'block';
    } else {
      this.controlsGuide.style.display = 'none';
    }
  }
} 