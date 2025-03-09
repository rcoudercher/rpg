import { Game } from './Game';

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing game...');
  const game = new Game();
  
  // Add the game instance to the window for debugging
  (window as any).game = game;
}); 