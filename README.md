# WoW Game

A simple World of Warcraft / Elden Ring / Zelda style prototype.

## Development

### Prerequisites

- Node.js (v22 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Code Formatting

This project uses Prettier with the prettier-plugin-organize-imports plugin for consistent code formatting and import organization.

### Format All Files

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

### VS Code Integration

If you're using VS Code, install the Prettier extension and the project settings will automatically format your code on save.

1. Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension
2. The project's `.vscode/settings.json` will enable format on save and organize imports automatically

### Prettier Configuration

The Prettier configuration is defined in `.prettierrc` with the following settings:

- Single quotes
- 2 space indentation
- Semicolons
- 100 character line width
- Trailing commas in objects and arrays
- No parentheses around single arrow function parameters
