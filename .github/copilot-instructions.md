# Copilot Instructions for Photo Organizer

## Architecture Overview

This is an Electron desktop application with a React frontend for organizing photos into albums. The app follows a strict main/renderer process separation with secure IPC communication.

### Key Components

- **Main Process** (`electron/main.ts`): Handles file operations, image processing with Sharp, settings persistence, and folder scanning
- **Renderer Process** (`src/`): React app with TypeScript, Context API state management, and component-based UI
- **IPC Bridge** (`electron/preload.ts`): Secure communication layer exposing `window.electronAPI` to renderer

### State Management Pattern

All state flows through `PhotoContext.tsx` using useReducer pattern:

```tsx
const { state, dispatch } = usePhotoContext();
dispatch({ type: "SET_PHOTOS", payload: photos });
```

Never directly modify state - always use typed dispatch actions. The reducer auto-sorts albums alphabetically on `SET_ALBUMS` and `ADD_ALBUM`.

## Development Workflow

### Building & Running

```bash
npm start           # Concurrent dev server (React + Electron)
npm run build       # Build both renderer and main
npm run package:win # Create Windows installer
```

The build process requires two separate TypeScript configs:

- `tsconfig.json` for React (ES modules, DOM types)
- `tsconfig.electron.json` for main process (CommonJS, Node types)

### File Operations

All file system operations go through IPC handlers in `main.ts`. Never use Node.js APIs directly in renderer components:

```tsx
// ✅ Correct
const result = await window.electronAPI.copyFileToAlbum(sourcePath, destPath, albumName);

// ❌ Wrong - Node APIs not available in renderer
import fs from "fs";
```

## Project-Specific Patterns

### Session Persistence

The app saves user state between sessions using JSON files in `app.getPath("userData")`. Key feature: **folder hash detection** - if source folder contents change, photo position resets to 0:

```typescript
// In main.ts - folder hash prevents stale position data
const currentHash = await this.generateFolderHash(sourceFolder);
if (currentHash !== settings.lastSourceFolderHash) {
	return 0; // Reset position
}
```

### Image Processing

Uses Sharp library for thumbnail generation and image data serving. All images are converted to base64 data URLs for renderer display:

```typescript
// Thumbnails: 300x300 JPEG at 80% quality
// Full images: Preserve original format but convert to base64
```

### Component Communication

Components communicate through:

1. **Shared context state** - for app-wide data (photos, albums, folders)
2. **IPC calls** - for file operations and system integration
3. **Local component state** - for UI-specific data (form inputs, loading states)

### Error Handling Convention

IPC handlers return objects with success/error structure:

```typescript
return { success: true, targetPath };
// or
return { success: false, error: "File already exists" };
```

Always handle both success and error cases in components.

### CSS & Styling

Uses CSS custom properties (`:root` variables) with Google-inspired design system. Component styles are co-located (`.component.css` files). Global styles in `index.css` define the design tokens.

### Debug Infrastructure

Built-in debug panel (top-right in dev) provides access to:

- Settings file inspection
- Photo index persistence testing
- Folder hash verification

Use `DebugPanel.tsx` pattern for development utilities.

## Integration Points

### Electron-React Bridge

Type-safe IPC through `ElectronAPI` interface defined in `preload.ts`. All main process functions are async and return promises. The renderer declares the API in `App.tsx` global interface.

### External Dependencies

- **Sharp**: Image processing (thumbnails, format conversion)
- **fs-extra**: Enhanced file operations with async/await
- **electron-builder**: Application packaging and distribution

### File Structure Conventions

```
electron/          # Main process (Node.js environment)
src/               # Renderer process (Browser environment)
  components/      # React components with co-located CSS
  context/         # Global state management
build/             # React build output
dist/main/         # Electron build output
```

Never mix main and renderer code - they run in completely separate processes with different capabilities.
