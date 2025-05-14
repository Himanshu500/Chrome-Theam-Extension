# HackerSpace Chrome Extension

A high-tech new tab replacement for Chrome with physics-based animations, fluid interactions, and a modern hacker aesthetic.

## Features

- **Physics-Based Animations**: Fluid-like particle interactions that respond to your mouse movements using Matter.js physics engine
- **Space-Themed 3D Background**: Dynamic starfield with parallax effect using Three.js
- **Interactive 3D Universe**: Explore a realistic planetary system with camera controls and position saving
- **Smart Website Shortcuts**: Interactive website shortcuts with fluid hover animations
- **Customizable Widgets**: Task manager, weather display, and system status indicators
- **Multiple Themes**: Choose from Hacker, Cyberpunk, Matrix, and Space themes
- **Search Integration**: Quick search with voice input support
- **Customizable Settings**: Control animation density, physics intensity, and more

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store page (link coming soon)
2. Click "Add to Chrome"

### Manual Installation
1. Download or clone this repository
2. Generate icons using the tool in `assets/generate_icons.html` (open this file in your browser)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the extension directory
6. The extension is now installed and will replace your new tab page

## Usage

- **Search**: Type in the search bar or press `/` to focus it
- **Shortcuts**: Click on shortcuts to visit websites, hover for fluid animations
- **Tasks**: Add and manage tasks in the Task Sequence widget
- **Settings**: Click the gear icon to customize themes, animations, and shortcuts

### Universe Mode Controls

The 3D Universe background offers interactive exploration:

- **Virtual Joystick**: Use the on-screen joystick (bottom-left) to move the camera through space
- **Mouse/Touch Controls**: Click and drag to rotate the view, use scroll wheel to zoom
- **Position Saving**: Save your favorite viewpoints using the "Save Position" button (top-right)
- **Position Management**: 
  - Click any saved position to instantly teleport there
  - Use the play button to load a saved position
  - Delete positions you no longer need
- **Settings**: Adjust universe physics intensity to control joystick sensitivity

## Customization

### Theme Selection
1. Click the settings icon in the bottom-right corner
2. Choose from four themes: Hacker, Cyberpunk, Matrix, and Space

### Adding Shortcuts
1. Open settings and navigate to "Shortcut Management" 
2. Click "Add New Shortcut"
3. Enter a name, URL, and optional SVG icon
4. Save to add the shortcut to your new tab page

### Animation Settings
Adjust particle density, animation speed, and physics intensity in the settings panel to fit your preference and system performance.

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript

### Project Structure
- `manifest.json`: Extension configuration
- `newtab.html`: Main new tab page
- `styles.css`: Styling for the new tab page
- `js/`: JavaScript files for each component
  - `universeAnimation.js`: Three.js 3D universe with interactive camera control
  - `background.js`: Three.js space background
  - `particles.js`: Matter.js physics particles
  - `shortcuts.js`: Website shortcuts management
  - `clock.js`: Digital clock implementation
  - `weather.js`: Weather widget
  - `tasks.js`: Task manager
  - `settings.js`: Settings panel and customization
  - `main.js`: Main initialization script
- `lib/`: External libraries
  - `three.min.js`: Three.js library for 3D graphics
  - `OrbitControls.js`: Camera controls for Three.js
  - `matter.min.js`: Physics engine for particle simulations
- `assets/`: Icons and other assets
  - `textures/`: Texture files for 3D objects
  - `generate_icons.html`: Tool to generate extension icons

### Generating Icons
1. Open `assets/generate_icons.html` in your browser
2. Click "Generate Icons" button
3. Right-click each icon and select "Save Image As" to save them as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for bugs, feature requests, or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Matter.js](https://brm.io/matter-js/) for physics simulations
- [Three.js](https://threejs.org/) for 3D graphics
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) font
- All the amazing open source developers who make projects like this possible 