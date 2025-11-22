# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

VibeBox is a React Native mobile media player application for both audio and video playback. The app scans local device storage for media files and provides a native player experience with background audio support using react-native-track-player.

**Key Technologies:**
- React Native 0.75.1
- TypeScript
- React Navigation (native stack)
- react-native-track-player (background audio)
- react-native-video (video playback)
- react-native-fs (file system access)
- react-native-permissions (storage permissions)

## Development Commands

### Setup
```powershell
# Install dependencies
npm install

# iOS only: Install CocoaPods (first time)
bundle install

# iOS only: Install pods (after dependency changes)
bundle exec pod install
```

### Running the App
```powershell
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing & Quality
```powershell
# Run tests
npm test

# Run ESLint
npm run lint

# Run on specific Android device/emulator
npm run android -- --deviceId=<device_id>

# Run on specific iOS simulator
npm run ios -- --simulator="iPhone 15"
```

### Troubleshooting
```powershell
# Clean Metro cache
npm start -- --reset-cache

# Clean Android build
cd android && ./gradlew clean && cd ..

# Clean iOS build (macOS only)
cd ios && xcodebuild clean && cd ..

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install
```

## Architecture

### Application Structure

**Entry Point:** `index.js` registers the main App component and TrackPlayer background service.

**Navigation Flow:**
- `App.tsx` - Root component with NavigationContainer and Stack Navigator
  - `HomeScreen` - Main screen with tabbed audio/video lists
  - `AudioPlayerScreen` - Full-screen audio player with playlist support
  - `VideoPlayerScreen` - Full-screen video player

### Core Service Layer

**MediaService** (`src/services/MediaService.js`)
- Singleton service that scans device storage for media files
- Recursively searches common media directories (Music, Movies, Downloads, DCIM)
- Filters by audio/video extensions and returns categorized file objects
- Handles platform-specific path differences (Android vs iOS)
- Configurable max depth scanning (default: 3 levels)

**TrackPlayerService** (`src/services/TrackPlayerService.js`)
- Background playback service registered in `index.js`
- Handles remote control events (play, pause, next, previous, seek)
- Must be registered with `TrackPlayer.registerPlaybackService()` at app startup
- Runs in separate thread for background audio functionality

**AudioPlayerService** (`src/services/AudioPlayerService.js`)
- High-level wrapper around react-native-track-player
- Manages playlist queue, playback state, and seek operations
- Provides convenient methods for common player operations

**PermissionsService** (`src/services/PermissionsService.js`)
- Handles storage permissions with platform-specific logic
- Android 13+ (API 33+): Uses granular READ_MEDIA_AUDIO and READ_MEDIA_VIDEO
- Android 12 and below: Uses READ_EXTERNAL_STORAGE
- iOS: Automatically granted (handled by system)

### Component Organization

**Screens** (`src/screens/`)
- Feature-complete screen components
- Manage navigation params and service interactions
- Handle permission flows and loading states

**Components** (`src/components/`)
- Reusable UI components (MediaList, PlayerControls, CustomTabBar, LoadingScreen)
- Presentational components with minimal business logic

**Utils** (`src/utils/`)
- `constants.js` - Centralized configuration (colors, sizes, player config, messages, etc.)
- `helpers.js` - Utility functions
- All constants are exported both named and as default object

### Key Patterns

**TrackPlayer Initialization:**
- App.tsx sets up TrackPlayer on mount with capabilities configuration
- Must check if already initialized to avoid "already been initialized" error
- Setup includes playback capabilities for notification controls

**Permission Handling:**
- Check permissions on HomeScreen mount
- Show permission prompt UI if denied
- Support for both legacy and modern Android permission systems

**Media Scanning:**
- Performed on app start and pull-to-refresh
- Scans multiple platform-specific directories
- Filters hidden folders (starting with '.') and system folders ('Android')
- Returns structured objects with id, name, path, size, extension, type, uri

**Navigation State:**
- Non-serializable values (track objects) passed via route params
- LogBox configured to ignore navigation state warnings
- Modal and fullScreenModal presentations for player screens

## Important Implementation Notes

### Platform Differences

**Android:**
- Requires storage permissions (different for API 33+)
- File URIs must be prefixed with `file://`
- Storage paths: /Music, /Download, /Movies, /DCIM
- Requires proper AndroidManifest.xml permissions

**iOS:**
- Automatic permission handling
- Requires CocoaPods for native dependencies
- Run `bundle exec pod install` after adding native modules
- Storage paths: DocumentDirectory, LibraryDirectory

### TrackPlayer Integration

- TrackPlayerService MUST be registered in index.js before app starts
- Player setup must happen once in App.tsx useEffect
- Always check if player is already initialized before setup
- Use event listeners (useTrackPlayerEvents) for state updates
- Background playback requires proper capabilities configuration

### File System Access

- Use RNFS (react-native-fs) for all file operations
- Platform-specific path constants in MediaService
- Recursive directory scanning with depth limits (prevents infinite loops)
- Filter out system/hidden folders to improve performance

### State Management

- Local state with useState/useEffect in screens
- No global state management library currently used
- Services are singleton instances for shared state

## Configuration Files

- `babel.config.js` - Babel configuration for React Native
- `metro.config.js` - Metro bundler configuration
- `tsconfig.json` - TypeScript configuration extending @react-native defaults
- `jest.config.js` - Test configuration (React Native preset)
- `.eslintrc.js` - ESLint configuration extending @react-native
- `.prettierrc.js` - Code formatting rules

## Native Dependencies

When adding or updating native dependencies:
1. Run `npm install`
2. **Android:** Rebuild app with `npm run android`
3. **iOS:** Run `bundle exec pod install`, then rebuild with `npm run ios`

## Patch Management

The project uses `patch-package` to apply patches to node_modules:
- Patches stored in `patches/` directory
- Applied automatically via `postinstall` script
- Create patches: `npx patch-package <package-name>`

## Debugging

**Metro Logs:** Check terminal running `npm start`
**Device Logs:**
- Android: `adb logcat *:S ReactNative:V ReactNativeJS:V`
- iOS: Xcode Console or `react-native log-ios`

**TrackPlayer Issues:** Enable verbose logging in TrackPlayerService

**Permission Issues:** Check AndroidManifest.xml for proper permissions on Android

**File Not Found:** Verify file URIs include `file://` prefix on Android
