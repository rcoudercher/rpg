import axios from 'axios';
import { PlayerState, GameState } from '../models/types';

// Default fallback values when server is unavailable
const defaultPlayer: PlayerState = {
  x: 0,
  y: 0,
  z: 0,
  inventory: []
};

const defaultEnemies = [
  {
    type: 'wolf',
    x: 10,
    y: 0,
    z: 0
  }
];

export class GameAPI {
  /**
   * Get player state from server
   */
  public static async getPlayer(): Promise<PlayerState> {
    try {
      const response = await axios.get('/api/player');
      return response.data;
    } catch (error) {
      console.error('Error getting player data:', error);
      console.warn('Using default player data due to server error');
      return { ...defaultPlayer };
    }
  }
  
  /**
   * Update player position on server
   */
  public static async updatePlayerPosition(x: number, y: number, z: number): Promise<PlayerState> {
    try {
      const response = await axios.post('/api/player/move', { x, y, z });
      return response.data;
    } catch (error) {
      console.error('Error updating player position:', error);
      console.warn('Server unavailable, continuing with local state only');
      // Return a local update without server validation
      return { ...defaultPlayer, x, y, z };
    }
  }
  
  /**
   * Get enemies from server
   */
  public static async getEnemies(): Promise<any[]> {
    try {
      const response = await axios.get('/api/enemies');
      return response.data;
    } catch (error) {
      console.error('Error getting enemies:', error);
      console.warn('Using default enemies due to server error');
      return [...defaultEnemies];
    }
  }
  
  /**
   * Pick up an item
   */
  public static async pickupItem(itemType: string): Promise<PlayerState> {
    try {
      const response = await axios.post('/api/items/pickup', { itemType });
      return response.data;
    } catch (error) {
      console.error('Error picking up item:', error);
      console.warn('Server unavailable, simulating item pickup locally');
      // Simulate item pickup locally
      const updatedPlayer = { ...defaultPlayer };
      if (itemType === 'sword' && !updatedPlayer.inventory.includes('sword')) {
        updatedPlayer.inventory.push('sword');
      }
      return updatedPlayer;
    }
  }
  
  /**
   * Reset game state
   */
  public static async resetGame(): Promise<GameState> {
    try {
      const response = await axios.post('/api/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting game:', error);
      console.warn('Server unavailable, using default game state');
      // Return default game state
      return {
        player: { ...defaultPlayer },
        enemies: [...defaultEnemies],
        items: [{ type: 'sword', x: 5, y: 0, z: 0 }]
      };
    }
  }
} 