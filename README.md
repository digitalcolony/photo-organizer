# Photo Organizer

A desktop application for organizing photos into albums with a modern, Google-inspired interface. Built with Electron, React, and TypeScript.

## Features

- **📁 Folder Selection**: Select source and destination folders for photo organization
- **💾 Folder Memory**: Automatically remembers your last used folders between sessions
- **📍 Position Memory**: Remembers where you left off in photo organization between sessions
- **🖼️ Image Preview**: Large preview pane with navigation controls
- **📚 Album Management**: Create and manage photo albums on-the-fly with alphabetical sorting
- **🎯 Quick Assignment**: One-click photo assignment to albums with duplicate detection
- **⌨️ Keyboard Shortcuts**: Full keyboard navigation support
- **📊 Progress Tracking**: Visual progress indicators and statistics
- **🔍 Album Explorer**: Expandable album view showing photos in each album
- **🔧 Debug Panel**: Built-in debugging tools for troubleshooting
- **🎨 Modern UI**: Clean, Google-inspired design with light mode
- **🔄 Smart State Management**: Intelligent folder hash checking to detect content changes

## Quick Start

### Prerequisites

- Node.js 16+ installed
- Windows 11 (primary target platform)

### Installation

1. Clone or download the project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Building for Production

```bash
# Build the application
npm run build

# Package for Windows
npm run package:win
```

## Usage

### Initial Setup

1. **Launch the application**
2. **Folder Auto-loading**: If you've used the app before, your last selected folders will be automatically loaded
3. **Position Restoration**: The app will resume from where you left off in your photo organization
4. **Select Source Folder** (if not auto-loaded): Choose the folder containing photos to organize
5. **Select Destination Folder** (if not auto-loaded): Choose where organized albums will be created
6. **Start Organizing**: Click "Start Organizing" to begin or resume

### Organizing Photos

1. **Resume or Start**: The app automatically resumes from where you left off, or starts from the beginning for new folders
2. **Preview**: View the current photo in the main preview pane
3. **Select Album**: Choose an existing album from the alphabetically sorted list or create a new one
4. **Assign**: Click "Assign Photo" or press `Space` to copy the photo to the album
5. **Navigate**: Use arrow keys or buttons to move between photos
6. **Album Explorer**: Click on albums in the sidebar to view their contents
7. **Debug**: Use the debug panel (top-right) to check settings and troubleshoot issues

### Album Management

- **Automatic Sorting**: Albums are automatically sorted alphabetically both on load and when created
- **Duplicate Prevention**: The app prevents copying the same photo to an album twice
- **Photo Count**: Each album shows the number of photos it contains
- **Expandable View**: Click on albums to see all photos within them
- **Quick Navigation**: Click on photos in album view to jump to that photo in the main view

### Keyboard Shortcuts

- **←/→**: Previous/Next photo
- **Space**: Assign current photo to selected album
- **Ctrl+R**: Rename (future feature)
- **Ctrl+Z**: Undo (future feature)
- **Escape**: Cancel album creation
- **Enter**: Confirm album creation

## Project Structure

```
photo-organizer/
├── electron/           # Electron main process
│   ├── main.ts        # Main application logic with IPC handlers
│   └── preload.ts     # Renderer communication bridge
├── src/               # React application
│   ├── components/    # React components
│   │   ├── AlbumManager.tsx      # Album sidebar with expandable view
│   │   ├── DebugPanel.tsx        # Debug tools component
│   │   ├── FolderSelector.tsx    # Folder selection interface
│   │   ├── PhotoViewer.tsx       # Main photo display and controls
│   │   └── StatusBar.tsx         # Status and progress display
│   ├── context/       # State management
│   │   └── PhotoContext.tsx      # Global app state management
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Entry point
├── public/            # Static assets
├── build/             # Production build output
└── package.json       # Dependencies and scripts
```

## Technologies Used

- **Electron**: Desktop application framework
- **React 18**: User interface library with hooks and context
- **TypeScript**: Type-safe JavaScript with full type coverage
- **Context API**: Centralized state management with reducers
- **Sharp**: High-performance image processing and thumbnail generation
- **fs-extra**: Enhanced file system operations with async/await
- **IPC (Inter-Process Communication)**: Secure main/renderer communication

## Key Technical Features

- **Session Persistence**: Photo position and folder selections saved between sessions
- **Smart Folder Detection**: Hash-based detection of folder content changes
- **Automatic Sorting**: Albums maintained in alphabetical order at all times
- **Duplicate Prevention**: Intelligent checking to prevent duplicate photo assignments
- **Concurrent Operations**: Non-blocking file operations with progress feedback
- **Type Safety**: Full TypeScript coverage for robust development

## Development

### Available Scripts

- `npm start`: Start development server with hot reload
- `npm run build`: Build both renderer and main processes
- `npm run build:renderer`: Build React application
- `npm run build:electron`: Build Electron main process
- `npm test`: Run tests
- `npm run package`: Create distributable package

### Architecture

The application follows Electron's main/renderer process architecture with enhanced IPC communication:

- **Main Process**: Handles file system operations, image processing, settings persistence, and system integration
- **Renderer Process**: React application providing the user interface with TypeScript components
- **IPC Communication**: Secure bidirectional communication between processes via preload script
- **State Management**: Centralized Context API with reducer pattern for predictable state updates
- **Session Persistence**: JSON-based settings storage in user data directory with folder change detection

## Features (MVP) ✅ **COMPLETED**

- [x] Basic image preview and navigation
- [x] Simple album creation and assignment with duplicate prevention
- [x] File copy operations with error handling
- [x] Full keyboard shortcuts support
- [x] Google-inspired UI design with modern styling
- [x] Folder selection and recursive scanning
- [x] Session persistence (folders and photo position)
- [x] Alphabetical album sorting
- [x] Album explorer with photo listings
- [x] Debug panel for troubleshooting
- [x] Smart folder content change detection
- [x] Progress tracking and statistics

## Troubleshooting

### Position Not Remembered

- Use the Debug Panel (top-right button) to check if settings are being saved
- Verify that the source folder hasn't changed (new/deleted photos will reset position)
- Check console output for folder hash mismatches

### Albums Not Sorting

- Albums should automatically sort alphabetically when created or loaded
- If issues persist, restart the application

### Performance Issues

- Large photo collections (>1000 photos) may experience slower initial scanning
- Consider organizing photos in smaller batches for better performance

### Debug Panel

- Click the "Debug" button in the top-right corner when the app is running
- Use "Get Settings Info" to view current app settings and file paths
- Use "Save Current Index" and "Get Saved Index" to test position saving

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository.
