import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Initial game state
const initialGameState = {
  player: {
    x: 0,
    y: 0,
    z: 0,
    inventory: []
  },
  enemies: [
    {
      type: 'wolf',
      x: 10,
      y: 0,
      z: 0
    }
  ],
  items: [
    {
      type: 'sword',
      x: 5,
      y: 0,
      z: 0
    }
  ]
};

// In-memory data store (clone of initial state)
let gameState = JSON.parse(JSON.stringify(initialGameState));

// Endpoints
app.get('/api/player', (req, res) => {
  res.json(gameState.player);
});

app.post('/api/player/move', (req, res) => {
  const { x, y, z } = req.body;
  gameState.player.x = x;
  gameState.player.y = y;
  gameState.player.z = z;
  res.json(gameState.player);
});

app.get('/api/enemies', (req, res) => {
  res.json(gameState.enemies);
});

app.post('/api/items/pickup', (req, res) => {
  const { itemType } = req.body;
  if (itemType === 'sword' && !gameState.player.inventory.includes('sword')) {
    gameState.player.inventory.push('sword');
    gameState.items = gameState.items.filter(item => item.type !== 'sword');
  }
  res.json(gameState.player);
});

// Reset game state endpoint
app.post('/api/reset', (req, res) => {
  gameState = JSON.parse(JSON.stringify(initialGameState));
  res.json({ message: 'Game state reset successfully', gameState });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 