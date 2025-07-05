# Photo Organizer

A desktop application for organizing photos into albums with a modern, Google-inspired interface. Built with Electron, React, and TypeScript.

## Features

- **📁 Folder Selection**: Select source and destination folders for photo organization
- **� Folder Memory**: Automatically remembers your last used folders between sessions
- **�🖼️ Image Preview**: Large preview pane with navigation controls
- **📚 Album Management**: Create and manage photo albums on-the-fly
- **🎯 Quick Assignment**: One-click photo assignment to albums
- **⌨️ Keyboard Shortcuts**: Full keyboard navigation support
- **📊 Progress Tracking**: Visual progress indicators and statistics
- **🎨 Modern UI**: Clean, Google-inspired design with light mode

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
3. **Select Source Folder** (if not auto-loaded): Choose the folder containing photos to organize
4. **Select Destination Folder** (if not auto-loaded): Choose where organized albums will be created
5. **Start Organizing**: Click "Start Organizing" to begin

### Organizing Photos

1. **Preview**: View the current photo in the main preview pane
2. **Select Album**: Choose an existing album or create a new one
3. **Assign**: Click "Assign Photo" or press `Space` to copy the photo to the album
4. **Navigate**: Use arrow keys or buttons to move between photos

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
│   ├── main.ts        # Main application logic
│   └── preload.ts     # Renderer communication
├── src/               # React application
│   ├── components/    # React components
│   ├── context/       # State management
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Entry point
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Technologies Used

- **Electron**: Desktop application framework
- **React 18**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Context API**: State management
- **Sharp**: Image processing
- **fs-extra**: Enhanced file system operations

## Development

### Available Scripts

- `npm start`: Start development server with hot reload
- `npm run build`: Build both renderer and main processes
- `npm run build:renderer`: Build React application
- `npm run build:electron`: Build Electron main process
- `npm test`: Run tests
- `npm run package`: Create distributable package

### Architecture

The application follows Electron's main/renderer process architecture:

- **Main Process**: Handles file system operations, image processing, and system integration
- **Renderer Process**: React application providing the user interface
- **IPC Communication**: Secure communication between processes via preload script

## Phase 1 Features (MVP) ✅

- [x] Basic image preview and navigation
- [x] Simple album creation and assignment
- [x] File copy operations
- [x] Basic keyboard shortcuts
- [x] Google-inspired UI design
- [x] Folder selection and scanning

## Phase 2 Features (Planned)

- [ ] File renaming functionality
- [ ] Undo operations
- [ ] Enhanced UI/UX improvements
- [ ] Settings and preferences panel

## Phase 3 Features (Planned)

- [ ] Batch operations
- [ ] Duplicate detection and removal
- [ ] EXIF metadata display
- [ ] Performance optimizations

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
