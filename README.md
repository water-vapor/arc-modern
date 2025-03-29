# ARC Modern Interface

A modern, responsive web interface for the Abstract Reasoning Challenge (ARC).

## Overview

This application provides a sleek, user-friendly interface for interacting with ARC puzzles. It maintains all the functionality of the original interface but with a modern design and improved user experience.

## Features

- Modern UI with responsive design
- Load tasks from GitHub repositories, local files, or by index
- Interactive grid editor with multiple tools:
  - Direct cell editing
  - Selection tool for editing multiple cells at once
  - Flood fill tool
- Task navigation (previous, next, random)
- Test case navigation
- Solution validation
- Grid resizing
- Symbol number display toggle
- Clear error/success notifications

## Technology Stack

- Vue.js 3 with Composition API
- Vuex for state management 
- SCSS for styling
- Responsive design that works on desktop and mobile devices

## Running the Application

1. Install dependencies:
```
cd arc-modern
npm install
```

2. Start the development server:
```
npm run serve
```

3. Build for production:
```
npm run build
```

## Project Structure

```
arc-modern/
├── public/               # Public assets
├── src/
│   ├── assets/           # Static assets
│   │   └── styles/       # Global styles
│   ├── components/       # Vue components
│   ├── store/            # Vuex store
│   ├── utils/            # Utility functions
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   ├── main.js           # Application entry point
│   └── router/           # Vue Router configuration
└── package.json          # Project dependencies
```

## Components

- **GridComponent**: Displays and allows interaction with a grid
- **SymbolPicker**: Allows selecting a symbol (color) for grid cells
- **Toolbar**: Tools for editing the grid and changing settings
- **TaskPairPreview**: Displays an input-output pair example
- **TaskControls**: Navigation and control buttons for tasks
- **Notification**: Displays success/error messages

## Usage

1. Use the welcome screen to load a random task or upload a JSON task file
2. Examine the examples to understand the pattern
3. Use the editing tools to solve the test input
4. Submit your solution to verify correctness

## License

Same as the original ARC project. 