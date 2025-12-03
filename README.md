# 🎵 VibeBox

<div align="center">

**A powerful offline local media player for Android & iOS**

Built with React Native, TypeScript, and SQLite

[Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 📱 Overview

VibeBox is a feature-rich, offline-first media player application that allows you to enjoy your local audio and video files with a beautiful, modern interface inspired by Spotify. Built with React Native and TypeScript, it provides a seamless experience for managing and playing your media library.

## ✨ Features

### 🎧 Audio Player

- **Advanced Playback Controls**: Play, pause, skip, seek, shuffle, and repeat
- **Background Playback**: Continue listening while using other apps
- **Media Notifications**: Control playback from notification panel
- **Queue Management**: View and manage your playback queue
- **Favorites System**: Mark your favorite tracks for quick access

### 🎬 Video Player

- **Full-Screen Playback**: Immersive video viewing experience
- **Gesture Controls**: Tap to show/hide controls, swipe to seek
- **Video Notifications**: Control video playback from notifications
- **Multiple Format Support**: MP4, MKV, AVI, MOV, WMV, and more

### 📂 Media Library

- **Smart Scanning**: Automatically scans and organizes your media files
- **Folder-Based Organization**: Browse media by folders
- **Search Functionality**: Quickly find your media files
- **Metadata Display**: Shows title, artist, duration, and file size
- **Dual View Modes**: Switch between audio and video libraries

### 🎼 Playlists

- **Create Custom Playlists**: Organize your music your way
- **Add to Playlist**: Easily add tracks from the player
- **Playlist Management**: Edit, delete, and reorder playlists
- **Visual Grid Layout**: Beautiful grid display with cover images

### 🗄️ Database & Storage

- **SQLite Database**: Fast, reliable local storage
- **Efficient Caching**: Quick access to media metadata
- **Database Debug Tools**: Monitor and optimize database performance
- **Smart Indexing**: Fast search and retrieval

### 🎨 User Interface

- **Modern Design**: Spotify-inspired dark theme
- **Smooth Animations**: Fluid transitions and interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Compact Sidebar**: Easy navigation between sections
- **Settings Panel**: Customize your experience

## 🛠️ Tech Stack

- **Framework**: React Native 0.75.1
- **Language**: TypeScript 5.8.3
- **Navigation**: React Navigation 6.x
- **Database**: SQLite (react-native-sqlite-storage)
- **Audio Engine**: React Native Track Player
- **Video Engine**: React Native Video
- **Storage**: AsyncStorage
- **Permissions**: React Native Permissions
- **File System**: React Native FS

## 📦 Installation

### Prerequisites

- Node.js >= 20
- React Native development environment set up ([Guide](https://reactnative.dev/docs/set-up-your-environment))
- Android Studio (for Android) or Xcode (for iOS)

### Clone the Repository

```bash
git clone https://github.com/zjceo/VibeBox.git
cd VibeBox
```

### Install Dependencies

```bash
npm install
```

### iOS Setup (macOS only)

```bash
# Install Ruby dependencies
bundle install

# Install CocoaPods dependencies
cd ios
bundle exec pod install
cd ..
```

### Run the Application

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

### Development

```bash
# Start Metro bundler
npm start

# Start with cache reset
npm start -- --reset-cache
```

## 🏗️ Architecture

### Project Structure

```
VibeBox/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── audio/          # Audio player components
│   │   ├── video/          # Video player components
│   │   ├── media/          # Media library components
│   │   ├── playlists/      # Playlist components
│   │   └── ui/             # Common UI components
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── AudioPlayerScreen.tsx
│   │   ├── VideoPlayerScreen.js
│   │   └── DatabaseDebugScreen.js
│   ├── services/           # Business logic & services
│   │   ├── AudioPlayerService.ts
│   │   ├── DatabaseService.ts
│   │   ├── MediaService.ts
│   │   ├── PlaylistService.ts
│   │   ├── PermissionsService.ts
│   │   └── TrackPlayerService.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── media.ts
│   │   ├── database.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   └── utils/              # Utility functions & constants
│       ├── constants.ts
│       ├── helpers.ts
│       └── index.ts
├── android/                # Android native code
├── ios/                    # iOS native code
└── App.tsx                 # Root component
```

### Key Services

#### DatabaseService

- Manages SQLite database operations
- Handles media metadata storage
- Provides CRUD operations for playlists and favorites
- Optimizes database performance

#### MediaService

- Scans device storage for media files
- Filters and organizes media by type
- Provides search and filtering capabilities
- Groups media by folders

#### AudioPlayerService

- Manages audio playback state
- Integrates with React Native Track Player
- Handles queue management
- Controls shuffle and repeat modes

#### PlaylistService

- Creates and manages playlists
- Adds/removes media from playlists
- Retrieves playlist items
- Handles playlist metadata

#### PermissionsService

- Requests storage permissions
- Handles permission states
- Provides permission status checks

## 🎯 Usage

### First Launch

1. **Grant Permissions**: Allow storage access when prompted
2. **Scan Media**: The app will automatically scan your device for media files
3. **Browse Library**: Navigate through your audio and video collections

### Playing Media

#### Audio

1. Tap on any audio file from the library
2. Use the full-screen player for advanced controls
3. Add to favorites or playlists
4. Manage your queue

#### Video

1. Tap on any video file from the library
2. Enjoy full-screen playback
3. Tap screen to show/hide controls
4. Use gestures for seeking

### Creating Playlists

1. Navigate to the Playlists section
2. Tap the "+" button to create a new playlist
3. Add songs from the audio player
4. Manage playlist items by long-pressing

### Database Management

Access the Database Debug screen from settings to:

- View database statistics
- Search media files
- Optimize database
- Clear cache
- Reset database (if needed)

## 🎨 Customization

### Theme Colors

Edit `src/utils/constants.ts` to customize the color scheme:

```typescript
export const COLORS = {
  primary: '#1DB954', // Main accent color
  background: '#121212', // Background color
  surface: '#2a2a2a', // Surface color
  // ... more colors
};
```

### Player Configuration

Modify player settings in `src/utils/constants.ts`:

```typescript
export const PLAYER_CONFIG = {
  progressUpdateInterval: 1000,
  controlsHideDelay: 3000,
  seekInterval: 10,
  // ... more settings
};
```

## 🔧 Troubleshooting

### Common Issues

**Metro bundler issues**

```bash
npm start -- --reset-cache
```

**Android build fails**

```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS build fails**

```bash
cd ios
bundle exec pod install
cd ..
npm run ios
```

**Permissions not working**

- Check `AndroidManifest.xml` for required permissions
- For iOS, check `Info.plist` for usage descriptions

## 📝 Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run postinstall` - Apply patches

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/)
- [React Native Track Player](https://react-native-track-player.js.org/)
- [React Native Video](https://github.com/react-native-video/react-native-video)
- [React Navigation](https://reactnavigation.org/)

## 📧 Contact

**Repository**: [https://github.com/zjceo/VibeBox](https://github.com/zjceo/VibeBox)

---

<div align="center">
Made with ❤️ using React Native
</div>
