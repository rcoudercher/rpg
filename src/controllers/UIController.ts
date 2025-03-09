export class UIController {
  private controlsGuide!: HTMLElement;
  private inventoryPanel!: HTMLElement;
  private inventoryItems!: HTMLElement;
  private wolfStatusIndicator!: HTMLElement;
  private wolfStatusText!: HTMLElement;
  private uiContainer!: HTMLElement;
  private keyBindingsButton!: HTMLElement;
  private debugMenu!: HTMLElement;
  private fpsDisplay!: HTMLElement;
  private frameRates: number[] = [];
  private lastFrameTime: number = 0;

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
    this.createDebugMenu();
    this.createInventoryPanel();
    this.createResetButton();
    this.createKeyBindingsButton();
  }

  /**
   * Create a container for all UI elements
   */
  private createUIContainer(): void {
    this.uiContainer = document.createElement("div");
    this.uiContainer.style.position = "fixed";
    this.uiContainer.style.top = "0";
    this.uiContainer.style.left = "0";
    this.uiContainer.style.width = "100%";
    this.uiContainer.style.height = "100%";
    this.uiContainer.style.pointerEvents = "none"; // Allow clicks to pass through to elements below
    this.uiContainer.style.zIndex = "1000";
    document.body.appendChild(this.uiContainer);
  }

  /**
   * Create controls guide
   */
  private createControlsGuide(): void {
    // Add controls guide
    this.controlsGuide = document.createElement("div");
    this.controlsGuide.style.position = "absolute";
    this.controlsGuide.style.top = "60px"; // Moved down to avoid overlap with the button
    this.controlsGuide.style.left = "20px";
    this.controlsGuide.style.padding = "15px";
    this.controlsGuide.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    this.controlsGuide.style.color = "white";
    this.controlsGuide.style.borderRadius = "5px";
    this.controlsGuide.style.fontFamily = "Arial, sans-serif";
    this.controlsGuide.style.fontSize = "14px";
    this.controlsGuide.style.maxWidth = "250px";
    this.controlsGuide.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    this.controlsGuide.style.pointerEvents = "auto"; // Make it clickable
    this.controlsGuide.style.zIndex = "1002"; // Ensure it's above the button

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
        
        <div style="text-align: right; font-weight: bold;">Attack:</div>
        <div>Spacebar</div>
      </div>
    `;

    this.uiContainer.appendChild(this.controlsGuide);

    // Add a button to toggle controls visibility
    const toggleControlsButton = document.createElement("button");
    toggleControlsButton.textContent = "Controls";
    toggleControlsButton.style.position = "absolute";
    toggleControlsButton.style.top = "20px";
    toggleControlsButton.style.left = "20px";
    toggleControlsButton.style.padding = "8px 15px";
    toggleControlsButton.style.backgroundColor = "#555555";
    toggleControlsButton.style.color = "white";
    toggleControlsButton.style.border = "none";
    toggleControlsButton.style.borderRadius = "5px";
    toggleControlsButton.style.cursor = "pointer";
    toggleControlsButton.style.fontWeight = "bold";
    toggleControlsButton.style.zIndex = "1001";
    toggleControlsButton.style.pointerEvents = "auto"; // Make it clickable

    // Add event listener to toggle controls visibility
    toggleControlsButton.addEventListener("click", () => {
      if (this.controlsGuide.style.display === "none") {
        this.controlsGuide.style.display = "block";
        toggleControlsButton.style.backgroundColor = "#555555";
      } else {
        this.controlsGuide.style.display = "none";
        toggleControlsButton.style.backgroundColor = "#333333";
      }
    });

    this.uiContainer.appendChild(toggleControlsButton);

    // Initially hide the controls guide
    this.controlsGuide.style.display = "none";
  }

  /**
   * Create debug menu
   */
  private createDebugMenu(): void {
    // Add debug menu
    this.debugMenu = document.createElement("div");
    this.debugMenu.style.position = "absolute";
    this.debugMenu.style.top = "60px"; // Moved down to avoid overlap with the button
    this.debugMenu.style.left = "120px"; // Positioned to the right of controls menu
    this.debugMenu.style.padding = "15px";
    this.debugMenu.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    this.debugMenu.style.color = "white";
    this.debugMenu.style.borderRadius = "5px";
    this.debugMenu.style.fontFamily = "Arial, sans-serif";
    this.debugMenu.style.fontSize = "14px";
    this.debugMenu.style.maxWidth = "250px";
    this.debugMenu.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    this.debugMenu.style.pointerEvents = "auto"; // Make it clickable
    this.debugMenu.style.zIndex = "1002"; // Ensure it's above the button

    // Create debug menu content with FPS display and controls
    this.debugMenu.innerHTML = `
      <h3 style="margin-top: 0; color: #ffcc00; text-align: center;">Debug Menu</h3>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center;">
        <div style="text-align: right; font-weight: bold;">FPS:</div>
        <div id="fps-display">0</div>
        
        <div style="text-align: right; font-weight: bold;">Frame Rate:</div>
        <div>
          <button id="fps-toggle" style="padding: 4px 8px; background-color: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Limit to 60 FPS
          </button>
        </div>
      </div>
    `;

    this.uiContainer.appendChild(this.debugMenu);

    // Store reference to FPS display element
    this.fpsDisplay = document.getElementById("fps-display") as HTMLElement;

    // Add a button to toggle debug menu visibility
    const toggleDebugButton = document.createElement("button");
    toggleDebugButton.textContent = "Debug";
    toggleDebugButton.style.position = "absolute";
    toggleDebugButton.style.top = "20px";
    toggleDebugButton.style.left = "120px"; // Positioned to the right of controls button
    toggleDebugButton.style.padding = "8px 15px";
    toggleDebugButton.style.backgroundColor = "#555555";
    toggleDebugButton.style.color = "white";
    toggleDebugButton.style.border = "none";
    toggleDebugButton.style.borderRadius = "5px";
    toggleDebugButton.style.cursor = "pointer";
    toggleDebugButton.style.fontWeight = "bold";
    toggleDebugButton.style.zIndex = "1001";
    toggleDebugButton.style.pointerEvents = "auto"; // Make it clickable

    // Add event listener to toggle debug menu visibility
    toggleDebugButton.addEventListener("click", () => {
      if (this.debugMenu.style.display === "none") {
        this.debugMenu.style.display = "block";
        toggleDebugButton.style.backgroundColor = "#555555";
      } else {
        this.debugMenu.style.display = "none";
        toggleDebugButton.style.backgroundColor = "#333333";
      }
    });

    this.uiContainer.appendChild(toggleDebugButton);

    // Initially hide the debug menu
    this.debugMenu.style.display = "none";
  }

  /**
   * Create inventory panel
   */
  private createInventoryPanel(): void {
    // Add inventory display
    this.inventoryPanel = document.createElement("div");
    this.inventoryPanel.style.position = "absolute";
    this.inventoryPanel.style.bottom = "20px";
    this.inventoryPanel.style.right = "20px"; // Changed from left to right
    this.inventoryPanel.style.width = "220px";
    this.inventoryPanel.style.padding = "15px";
    this.inventoryPanel.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
    this.inventoryPanel.style.color = "white";
    this.inventoryPanel.style.borderRadius = "5px";
    this.inventoryPanel.style.fontFamily = "Arial, sans-serif";
    this.inventoryPanel.style.border = "2px solid #8b4513";
    this.inventoryPanel.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    this.inventoryPanel.style.pointerEvents = "auto"; // Make it clickable

    // Inventory title
    const inventoryTitle = document.createElement("div");
    inventoryTitle.textContent = "INVENTORY";
    inventoryTitle.style.fontWeight = "bold";
    inventoryTitle.style.fontSize = "18px";
    inventoryTitle.style.marginBottom = "15px";
    inventoryTitle.style.textAlign = "center";
    inventoryTitle.style.borderBottom = "2px solid #8b4513";
    inventoryTitle.style.paddingBottom = "8px";
    this.inventoryPanel.appendChild(inventoryTitle);

    // Inventory items container
    this.inventoryItems = document.createElement("div");
    this.inventoryItems.style.minHeight = "60px";
    this.inventoryItems.style.marginTop = "10px";
    this.inventoryPanel.appendChild(this.inventoryItems);

    this.uiContainer.appendChild(this.inventoryPanel);
  }

  /**
   * Create reset button
   */
  private createResetButton(): void {
    // Create the button element directly
    const button = document.createElement("button");
    button.textContent = "RESET GAME";
    button.style.position = "absolute";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.padding = "12px 24px";
    button.style.backgroundColor = "#ff4444";
    button.style.color = "white";
    button.style.border = "3px solid white";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    button.style.fontSize = "16px";
    button.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.7)";
    button.style.fontFamily = "Arial, sans-serif";
    button.style.textTransform = "uppercase";
    button.style.pointerEvents = "auto"; // Make it clickable

    // Set ID for reference in the Game class
    button.id = "resetButton";

    this.uiContainer.appendChild(button);
  }

  /**
   * Create key bindings button
   */
  private createKeyBindingsButton(): void {
    // Create the button element directly
    const button = document.createElement("button");
    button.id = "key-bindings-button";
    button.textContent = "KEY BINDINGS";
    button.style.position = "absolute";
    button.style.bottom = "20px";
    button.style.left = "20px"; // Positioned on the left side
    button.style.padding = "12px 24px";
    button.style.backgroundColor = "#3366cc";
    button.style.color = "white";
    button.style.border = "3px solid #99ccff";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.fontWeight = "bold";
    button.style.fontSize = "16px";
    button.style.boxShadow = "0 0 20px rgba(153, 204, 255, 0.7)";
    button.style.fontFamily = "Arial, sans-serif";
    button.style.textTransform = "uppercase";
    button.style.pointerEvents = "auto"; // Make it clickable
    button.style.zIndex = "1001"; // Ensure it's above other elements

    // Store the button reference
    this.keyBindingsButton = button;

    this.uiContainer.appendChild(button);
  }

  /**
   * Update inventory display
   */
  public updateInventoryDisplay(
    playerInventory: string[],
    equippedWeapon: string | null = null,
  ): void {
    // Clear existing items
    this.inventoryItems.innerHTML = "";

    if (playerInventory.length === 0) {
      // Show empty inventory message
      const emptyText = document.createElement("div");
      emptyText.textContent = "Your bag is empty";
      emptyText.style.fontStyle = "italic";
      emptyText.style.color = "#aaa";
      emptyText.style.textAlign = "center";
      emptyText.style.marginTop = "10px";
      this.inventoryItems.appendChild(emptyText);
      return;
    }

    // Add each inventory item
    playerInventory.forEach((item) => {
      // Check if this is a gold item (format: "gold: X")
      if (item.startsWith("gold:")) {
        const goldAmount = item.split(":")[1].trim();
        this.addGoldItem(goldAmount);
      } else {
        this.addRegularItem(item, equippedWeapon === item);
      }
    });
  }

  /**
   * Add a gold item to the inventory display
   */
  private addGoldItem(amount: string): void {
    const itemElement = document.createElement("div");
    itemElement.style.padding = "10px";
    itemElement.style.margin = "8px 0";
    itemElement.style.backgroundColor = "rgba(100, 100, 100, 0.5)";
    itemElement.style.borderRadius = "5px";
    itemElement.style.display = "flex";
    itemElement.style.alignItems = "center";
    itemElement.style.borderLeft = "4px solid #FFD700"; // Gold color border

    // Gold icon
    const goldIcon = document.createElement("div");
    goldIcon.textContent = "💰"; // Money bag icon
    goldIcon.style.marginRight = "12px";
    goldIcon.style.fontSize = "22px";
    goldIcon.style.width = "30px";
    goldIcon.style.textAlign = "center";
    goldIcon.style.color = "#FFD700"; // Gold color

    // Gold amount
    const goldText = document.createElement("div");
    goldText.textContent = `${amount} Gold`;
    goldText.style.fontSize = "16px";
    goldText.style.fontWeight = "bold";
    goldText.style.color = "#FFD700"; // Gold color

    itemElement.appendChild(goldIcon);
    itemElement.appendChild(goldText);
    this.inventoryItems.appendChild(itemElement);
  }

  /**
   * Add a regular item to the inventory display
   */
  private addRegularItem(item: string, isEquipped: boolean): void {
    const itemElement = document.createElement("div");
    itemElement.style.padding = "10px";
    itemElement.style.margin = "8px 0";
    itemElement.style.backgroundColor = "rgba(100, 100, 100, 0.5)";
    itemElement.style.borderRadius = "5px";
    itemElement.style.display = "flex";
    itemElement.style.alignItems = "center";
    itemElement.style.justifyContent = "space-between"; // Space between item info and button

    // Item container (icon + name)
    const itemInfoContainer = document.createElement("div");
    itemInfoContainer.style.display = "flex";
    itemInfoContainer.style.alignItems = "center";

    // Item icon
    const itemIcon = document.createElement("div");

    if (item === "sword") {
      itemIcon.textContent = "⚔️";

      // Highlight if equipped
      if (isEquipped) {
        itemElement.style.borderLeft = "4px solid #ffcc00";
        itemElement.style.backgroundColor = "rgba(120, 120, 100, 0.6)";
      } else {
        itemElement.style.borderLeft = "4px solid #888888";
      }
    }

    itemIcon.style.marginRight = "12px";
    itemIcon.style.fontSize = "22px";
    itemIcon.style.width = "30px";
    itemIcon.style.textAlign = "center";

    // Item name
    const itemName = document.createElement("div");
    itemName.textContent = item.charAt(0).toUpperCase() + item.slice(1);
    itemName.style.fontSize = "16px";

    itemInfoContainer.appendChild(itemIcon);
    itemInfoContainer.appendChild(itemName);
    itemElement.appendChild(itemInfoContainer);

    // Equip/Unequip button
    const actionButton = document.createElement("button");

    if (isEquipped) {
      actionButton.textContent = "Unequip";
      actionButton.style.backgroundColor = "#aa5555";
    } else {
      actionButton.textContent = "Equip";
      actionButton.style.backgroundColor = "#55aa55";
    }

    actionButton.style.padding = "5px 10px";
    actionButton.style.border = "none";
    actionButton.style.borderRadius = "4px";
    actionButton.style.color = "white";
    actionButton.style.cursor = "pointer";
    actionButton.style.fontSize = "12px";
    actionButton.style.fontWeight = "bold";

    // Store item data for event handler
    actionButton.dataset.item = item;
    actionButton.dataset.action = isEquipped ? "unequip" : "equip";

    itemElement.appendChild(actionButton);
    this.inventoryItems.appendChild(itemElement);
  }

  /**
   * Get reset button
   */
  public getResetButton(): HTMLElement | null {
    return document.getElementById("resetButton");
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
    if (this.controlsGuide.style.display === "none") {
      this.controlsGuide.style.display = "block";
    } else {
      this.controlsGuide.style.display = "none";
    }
  }

  /**
   * Toggle debug menu visibility
   */
  public toggleDebugMenu(): void {
    if (this.debugMenu.style.display === "none") {
      this.debugMenu.style.display = "block";
    } else {
      this.debugMenu.style.display = "none";
    }
  }

  /**
   * Update frame rate display
   */
  public updateFrameRate(): void {
    const currentTime = performance.now();

    // Calculate delta time since last frame
    if (this.lastFrameTime > 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;

      // Store last 10 frame rates for averaging
      this.frameRates.push(fps);
      if (this.frameRates.length > 10) {
        this.frameRates.shift();
      }

      // Calculate average FPS
      const averageFps =
        this.frameRates.reduce((sum, value) => sum + value, 0) /
        this.frameRates.length;

      // Update FPS display if debug menu is visible
      if (this.debugMenu.style.display !== "none" && this.fpsDisplay) {
        this.fpsDisplay.textContent = averageFps.toFixed(1);
      }
    }

    this.lastFrameTime = currentTime;
  }

  /**
   * Set up FPS toggle button event listener
   */
  public setupFPSToggle(callback: (limitFPS: boolean) => void): void {
    const fpsToggleButton = document.getElementById("fps-toggle");
    if (fpsToggleButton) {
      let isLimited = true; // Start with FPS limited to 60

      fpsToggleButton.addEventListener("click", () => {
        isLimited = !isLimited;
        if (isLimited) {
          fpsToggleButton.textContent = "Limit to 60 FPS";
          fpsToggleButton.style.backgroundColor = "#555";
          callback(true); // Limit to 60 FPS
        } else {
          fpsToggleButton.textContent = "Uncapped FPS";
          fpsToggleButton.style.backgroundColor = "#773";
          callback(false); // Uncap FPS
        }
      });

      // Initialize with 60 FPS limit
      callback(true);
    }
  }

  /**
   * Set up inventory action buttons (equip/unequip)
   */
  public setupInventoryActions(
    callback: (action: string, item: string) => void,
  ): void {
    // Add event delegation to inventory container
    this.inventoryItems.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Check if a button was clicked
      if (
        target.tagName === "BUTTON" &&
        target.dataset.item &&
        target.dataset.action
      ) {
        const item = target.dataset.item;
        const action = target.dataset.action;

        // Call the callback with action and item
        callback(action, item);
      }
    });
  }
}
