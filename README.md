# ARC-AGI Modern Interface

A modern web interface for the Abstraction and Reasoning Corpus (ARC) challenge, supporting both the original ARC and ARC-AGI-2.

## Overview

This application provides an intuitive interface for exploring and solving ARC puzzles. It features:

- Support for both ARC-AGI 1 and ARC-AGI 2 challenges
- A clean, responsive UI for various screen sizes
- Interactive grid editing with multiple tools
- Example magnification for better pattern recognition
- Task navigation with 1-indexed display
- Solution validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/arc-modern.git
   cd arc-modern
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run serve
   ```

4. Build for production:
   ```
   npm run build
   ```

## Usage

1. **Load a puzzle**: Choose between ARC-AGI 1 and ARC-AGI 2, then select a task from the training or evaluation sets.
2. **Study examples**: Review the provided examples to understand the pattern.
3. **Create solution**: Use the editing tools to create your solution for the test input.
4. **Validate**: Submit your solution to check if it's correct.

## Features

- **Challenge Version Selection**: Switch between ARC-AGI 1 and ARC-AGI 2 datasets
- **Example Magnification**: Click on examples to expand them for easier analysis
- **Multiple Editing Tools**: Edit mode, select mode, and flood fill for efficient grid creation
- **Symbol Picker**: Quickly select symbols with visual color indicators
- **Responsive Design**: Works on desktops, tablets, and mobile devices

## Deployment

### GitHub Pages Deployment

This application is configured for easy deployment to GitHub Pages. You can deploy it in two ways:

#### Automatic Deployment (GitHub Actions)

1. Fork or push this repository to your GitHub account
2. Ensure the repository name is updated in `vue.config.js`:
   ```js
   publicPath: process.env.NODE_ENV === 'production'
     ? '/your-repo-name/'  // Update this line
     : '/'
   ```
3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"
4. Push to the main branch, and the GitHub Action will automatically build and deploy the site

#### Manual Deployment

1. Update the `publicPath` in `vue.config.js` with your repository name
2. Build the project:
   ```
   npm run build
   ```
3. Deploy to GitHub Pages:
   ```
   npm install -g gh-pages
   npm run deploy
   ```

### Accessing Your Deployed Application

After deployment, your application will be available at:
`https://yourusername.github.io/your-repo-name/`

## Built With

- [Vue.js](https://vuejs.org/) - The web framework used
- [Vuex](https://vuex.vuejs.org/) - State management
- [GitHub API](https://docs.github.com/en/rest) - For accessing ARC task data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original ARC challenge by François Chollet
- ARC-AGI 2 challenge by the ARC Prize Team 