import { KeyBindings } from "../models/types";
import { KeyBindingManager } from "./KeyBindingManager";

export class KeyBindingUI {
  private container: HTMLElement;
  private keyBindingManager: KeyBindingManager;
  private isVisible: boolean = false;
  private currentlyBinding: keyof KeyBindings | null = null;

  constructor(keyBindingManager: KeyBindingManager) {
    this.keyBindingManager = keyBindingManager;
    this.container = this.createUI();
    this.setupEventListeners();
  }

  /**
   * Create the key binding UI
   */
  private createUI(): HTMLElement {
    // Create container
    const container = document.createElement("div");
    container.id = "key-binding-ui";
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    container.style.color = "white";
    container.style.padding = "20px";
    container.style.borderRadius = "10px";
    container.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.7)";
    container.style.zIndex = "1001";
    container.style.display = "none";
    container.style.width = "500px";
    container.style.maxHeight = "80vh";
    container.style.overflowY = "auto";
    container.style.fontFamily = "Arial, sans-serif";

    // Create header
    const header = document.createElement("h2");
    header.textContent = "Key Bindings";
    header.style.textAlign = "center";
    header.style.marginTop = "0";
    header.style.color = "#ffcc00";
    container.appendChild(header);

    // Create description
    const description = document.createElement("p");
    description.textContent =
      "Click on a key to change its binding, then press the new key.";
    description.style.textAlign = "center";
    description.style.marginBottom = "20px";
    container.appendChild(description);

    // Create key binding list
    const bindingList = document.createElement("div");
    bindingList.id = "binding-list";

    // Add each key binding to the list
    const actions = this.keyBindingManager.getActions();
    const bindings = this.keyBindingManager.getBindings();

    actions.forEach((action) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.marginBottom = "10px";
      row.style.padding = "10px";
      row.style.borderRadius = "5px";
      row.style.backgroundColor = "rgba(50, 50, 50, 0.5)";

      // Action label and description
      const actionInfo = document.createElement("div");

      const actionLabel = document.createElement("div");
      actionLabel.textContent = action.label;
      actionLabel.style.fontWeight = "bold";
      actionInfo.appendChild(actionLabel);

      const actionDescription = document.createElement("div");
      actionDescription.textContent = action.description;
      actionDescription.style.fontSize = "0.8em";
      actionDescription.style.color = "#aaaaaa";
      actionInfo.appendChild(actionDescription);

      row.appendChild(actionInfo);

      // Key binding button
      const keyButton = document.createElement("button");
      keyButton.id = `bind-${action.id}`;
      keyButton.textContent = bindings[action.id].toUpperCase();
      keyButton.style.padding = "8px 12px";
      keyButton.style.backgroundColor = "#444444";
      keyButton.style.color = "white";
      keyButton.style.border = "1px solid #666666";
      keyButton.style.borderRadius = "4px";
      keyButton.style.cursor = "pointer";
      keyButton.style.minWidth = "80px";
      keyButton.style.textAlign = "center";

      keyButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.startBinding(action.id, keyButton);
      });

      row.appendChild(keyButton);

      bindingList.appendChild(row);
    });

    container.appendChild(bindingList);

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.justifyContent = "space-between";
    buttonsContainer.style.marginTop = "20px";

    // Reset to defaults button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset to Defaults";
    resetButton.style.padding = "10px 15px";
    resetButton.style.backgroundColor = "#aa3333";
    resetButton.style.color = "white";
    resetButton.style.border = "none";
    resetButton.style.borderRadius = "4px";
    resetButton.style.cursor = "pointer";

    resetButton.addEventListener("click", () => {
      this.resetToDefaults();
    });

    buttonsContainer.appendChild(resetButton);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Save & Close";
    closeButton.style.padding = "10px 15px";
    closeButton.style.backgroundColor = "#336633";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "4px";
    closeButton.style.cursor = "pointer";

    closeButton.addEventListener("click", () => {
      this.hide();
    });

    buttonsContainer.appendChild(closeButton);

    container.appendChild(buttonsContainer);

    // Add to document
    document.body.appendChild(container);

    return container;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for key presses when binding a key
    window.addEventListener("keydown", (e) => {
      if (this.currentlyBinding) {
        e.preventDefault();
        e.stopPropagation();

        // Handle special keys
        let keyValue = e.key;

        // Map spacebar to "space" for consistency
        if (keyValue === " ") {
          keyValue = "space";
        }

        // Map other special keys if needed
        // For example: Escape, Enter, etc.

        // Update the binding
        this.keyBindingManager.updateBinding(this.currentlyBinding, keyValue);

        // Update the UI
        this.updateBindingUI();

        // Clear the current binding
        this.currentlyBinding = null;

        // Remove the 'binding' class from all buttons
        const buttons = document.querySelectorAll("#binding-list button");
        buttons.forEach((button: Element) => {
          const btnElement = button as HTMLButtonElement;
          btnElement.classList.remove("binding");
          btnElement.style.backgroundColor = "#444444";
          btnElement.style.boxShadow = "none";
        });
      } else if (this.isVisible && e.key === "Escape") {
        // Close the UI when Escape key is pressed
        console.log("Escape key pressed, hiding key bindings UI");
        this.hide();
      }
    });

    // Close the UI when clicking outside
    document.addEventListener("click", (e) => {
      if (this.isVisible && !this.container.contains(e.target as Node)) {
        this.hide();
      }
    });

    // Prevent clicks inside the container from closing it
    this.container.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Start binding a key
   */
  private startBinding(
    actionId: keyof KeyBindings,
    button: HTMLButtonElement,
  ): void {
    // Clear any previous binding
    if (this.currentlyBinding) {
      const prevButton = document.getElementById(
        `bind-${this.currentlyBinding}`,
      ) as HTMLButtonElement;
      if (prevButton) {
        prevButton.classList.remove("binding");
        prevButton.style.backgroundColor = "#444444";
        prevButton.style.boxShadow = "none";
      }
    }

    // Set the current binding
    this.currentlyBinding = actionId;

    // Update the button to show it's being bound
    button.textContent = "Press a key...";
    button.classList.add("binding");
    button.style.backgroundColor = "#775500";
    button.style.boxShadow = "0 0 10px rgba(255, 204, 0, 0.7)";
  }

  /**
   * Update the binding UI
   */
  private updateBindingUI(): void {
    const bindings = this.keyBindingManager.getBindings();

    // Update each key binding button
    Object.entries(bindings).forEach(([actionId, key]) => {
      const button = document.getElementById(
        `bind-${actionId}`,
      ) as HTMLButtonElement;
      if (button) {
        // Format special keys for display
        let displayKey = key.toUpperCase();

        // Handle special keys
        if (key === "space") {
          displayKey = "SPACEBAR";
        } else if (key === "arrowup") {
          displayKey = "↑";
        } else if (key === "arrowdown") {
          displayKey = "↓";
        } else if (key === "arrowleft") {
          displayKey = "←";
        } else if (key === "arrowright") {
          displayKey = "→";
        } else if (key === "escape") {
          displayKey = "ESC";
        } else if (key === "enter") {
          displayKey = "ENTER";
        }

        button.textContent = displayKey;
      }
    });
  }

  /**
   * Reset bindings to defaults
   */
  private resetToDefaults(): void {
    // Reset the bindings
    this.keyBindingManager.resetToDefaults();

    // Update the UI
    this.updateBindingUI();
  }

  /**
   * Show the key binding UI
   */
  public show(): void {
    console.log("KeyBindingUI show called");
    // Update the UI with current bindings
    this.updateBindingUI();

    // Show the container
    this.container.style.display = "block";
    this.isVisible = true;
    console.log(
      "KeyBindingUI container display set to:",
      this.container.style.display,
    );
  }

  /**
   * Hide the key binding UI
   */
  public hide(): void {
    console.log("KeyBindingUI hide called");
    // Hide the container
    this.container.style.display = "none";
    this.isVisible = false;
    console.log(
      "KeyBindingUI container display set to:",
      this.container.style.display,
    );

    // Clear any active binding
    this.currentlyBinding = null;
  }

  /**
   * Toggle the key binding UI
   */
  public toggle(): void {
    console.log(
      "KeyBindingUI toggle called, current visibility:",
      this.isVisible,
    );
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if the UI is visible
   */
  public isOpen(): boolean {
    return this.isVisible;
  }
}
