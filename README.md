# Dual Enhances - Gota.io Tampermonkey Script
# Co

A feature-rich Tampermonkey userscript for Gota.io that adds dual-player control, advanced gameplay features, and UI improvements.
<img width="2529" height="1462" alt="image" src="https://github.com/user-attachments/assets/efd06e6a-f3bb-47d4-ad68-5133bcb086b3" />
<img width="2741" height="1462" alt="image" src="https://github.com/user-attachments/assets/865de679-e327-465c-85d6-0713ff9129a4" />


## Features

### Core Features
- **Dual Player Mode** - Control two players simultaneously with synchronized movements
- **Enhanced UI** - Modern, clean interface with customizable themes
- **Advanced Controls** - Extended keybindings for splits (double, triple, quad, hexa)
- **Camera Modes** - Multiple camera options including dual-view mode
- **Fast Feed** - Optimized feeding mechanics for competitive play
- **Linesplit Mode** - Advanced splitting techniques for skilled players

### UI Enhancements
- **Score Panels** - Detailed stats for both players including:
  - ID, Server, FPS, Ping
  - Mass, Score, Cell count
  - Mouse freeze indicator
- **Minimap Features**
  - Threat indicators
  - Chunk markers
  - Coordinate display
- **Chat System** - Enhanced chat with tabs, emotes, and commands
- **Leaderboard** - Improved leaderboard with additional information

### Visual Enhancements
- **Cursor Line** - Shows trajectory path for cells
- **Cell Ring** - Vibrant outline for controlled cells
- **Custom Cell Colors** - Personalized color schemes
- **Transparent Cells** - Optional transparency for better visibility
- **Name/Mass Display Options** - Granular control over what's displayed

### Performance Options
- **Quality Settings** - Ultra, High, Medium, Low, Very Low
- **Renderer Options** - WebGL/Canvas selection
- **Anti-aliasing Toggle**
- **View Distance Control**
- **Animation Delay Settings**

## Installation

### Prerequisites
- Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
  - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
  - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
  - [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### Script Installation

#### For Development (Local Testing)
1. Make sure Tampermonkey is installed and enabled
2. Set up a local web server (e.g., Live Server in VS Code) on port 5500
3. Place all project files in your local server directory
4. Install the `tampermonkey.js` script in Tampermonkey
5. The script will load resources from `http://localhost:5500/`

#### For Production Use
1. Host the files on a web server or use GitHub Pages
2. Modify the `tampermonkey.js` script to update the URLs:
   ```javascript
   const REPLACEMENT_BASE_URL = 'https://your-domain.com/path/';
   ```
3. Update all resource URLs in the script:
   ```javascript
   injectCSS('https://your-domain.com/path/styles.css');
   replaceScript("https://your-domain.com/path/dual-enhances.js");
   test("https://your-domain.com/path/index.html");
   ```
4. Install the modified script in Tampermonkey
5. The script metadata is already configured in `tampermonkey.js`:
   ```javascript
   // ==UserScript==
   // @name         Dual - Testing
   // @namespace    http://tampermonkey.net/
   // @version      1.0.0
   // @description  
   // @match        https://gota.io/web/
   // @icon         https://www.google.com/s2/favicons?sz=64&domain=gota.io
   // @grant        GM_webRequest
   // @grant        GM_log
   // @connect      localhost
   // @connect      127.0.0.1
   // @run-at       document-start
   // ==/UserScript==
   ```
6. Save and enable the script
7. Navigate to Gota.io to activate the enhancements

## Usage

### Basic Controls
- **Context Menu** - Right-click functionality
- **Toggle Spectate** - Switch between playing and spectating
- **Eject Mass** - W key (default)
- **Split** - Space key (default)
- **Multi-splits** - Configurable keys for 4x, 8x, 16x, 64x splits
- **Freeze Mouse** - Lock cursor position

### Dual Mode
- Enable in Extra Options menu
- Configure camera delay for smooth transitions
- Switch between players seamlessly

### Customization
Access settings through the gear icon to customize:
- Privacy options
- Performance settings
- Render options
- UI scale and visibility
- Keybindings

## File Structure

```
├── css/
│   ├── gota.css          # Core game styles
│   └── styles.css        # UI enhancement styles
├── html/
│   └── index.html        # Main application interface
├── javascript/
│   ├── tampermonkey.js   # Tampermonkey userscript loader
│   └── dual-enhances.js  # Core functionality and enhancements
└── README.md            # This file
```

### JavaScript Files

#### tampermonkey.js
This is the main Tampermonkey userscript that:
- Blocks the original Gota.io CSS to replace with custom styles
- Injects the enhanced UI from `index.html`
- Loads custom CSS files (`styles.css` and optionally `gota.css`)
- Replaces the original game script with `dual-enhances.js`
- Sets up the environment for the dual-player enhancements
- Currently configured for local development (localhost:5500)

#### dual-enhances.js
The core enhancement script containing:
- **Modal System**: Manages all popup dialogs and settings windows
- **Dual Player Control**: Simultaneous control of two players
- **Keybind Management**: Extensive customizable hotkeys
- **Linesplit Helper**: Advanced splitting technique with visual indicators
- **Camera Modes**: Default, Mass Weighted, and Ultra Smooth camera options
- **Fast Feed System**: Multiple targeting modes (Mouse Cursor, Biggest Cell, Smart Target)
- **Visual Enhancements**: Threat indicators, cell rings, cursor lines, custom colors
- **Firebase Integration**: For user authentication and social features
- **Chat System**: Enhanced chat with tabs, commands, and history
- **Performance Optimizations**: Texture caching, render optimizations

## Configuration

### Performance Tips
- Lower quality settings for better FPS
- Disable anti-aliasing on older systems
- Adjust view distance based on performance
- Use Canvas renderer for compatibility

### Privacy Settings
- Cookie preferences
- Global leaderboard visibility
- Profile sharing options

## Development

The userscript is built with:
- Vanilla JavaScript for core functionality
- PIXI.js for graphics rendering
- WebSocket for real-time communication
- Modern CSS with custom properties
- Firebase for authentication and social features

### Project Architecture

1. **Tampermonkey Script (`tampermonkey.js`)**
   - Intercepts and blocks original Gota.io resources
   - Injects custom HTML, CSS, and JavaScript
   - Manages resource loading from local/remote server

2. **Enhancement Script (`dual-enhances.js`)**
   - Core game modifications and features
   - Handles dual-player control logic
   - Manages UI interactions and settings
   - Implements advanced gameplay features

3. **UI Components**
   - Modal system for settings and dialogs
   - Enhanced HUD with dual score panels
   - Custom keybind configuration
   - Theme and visual customization options

### Key Features Implementation

- **Dual Player System**: Manages two independent player connections with synchronized control
- **Linesplit Helper**: Visual guides and axis-locking for precise splitting
- **Fast Feed Modes**: Different targeting algorithms for optimal feeding
- **Camera Modes**: Multiple viewport calculation methods
- **Threat Detection**: Analyzes nearby cells for danger indicators

### Debugging
- Use browser console (F12) to debug
- Check Tampermonkey dashboard for script errors
- Ensure script is running on correct URL patterns
- Monitor WebSocket traffic in Network tab
- Use `console.log` statements in the code for debugging

## Version

Current version: Beta 1.0.0

## Contributing

Feel free to submit issues and enhancement requests!

## Troubleshooting

### Common Issues
- **Script not loading**: Check if Tampermonkey is enabled and the script is active
- **Features not appearing**: Ensure you're on the correct Gota.io URL (gota.io/web/)
- **Performance issues**: Lower quality settings in the options menu
- **Conflicts**: Disable other Gota.io scripts to avoid conflicts

### Support
Report issues or request features through:
- GitHub Issues (if hosted on GitHub)
- Tampermonkey script comments section
- Gota.io community forums
- 
## Credits & Acknowledgments

Special thanks to the following contributors who helped make this project possible:
- **Ryal** - Feature development and innovative ideas
- **Onyx** - Frontend design and UI/UX concepts
- **Abyx** - Frontend development and implementation

This project was developed collaboratively with the help and inspiration from the Gota.io community.

## Disclaimer

This is an unofficial userscript for Gota.io. Use at your own risk and ensure compliance with the game's terms of service. The developers are not responsible for any account actions taken by Gota.io.

## License

This project is provided as-is for educational and enhancement purposes.
