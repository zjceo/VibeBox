// Audio Components
export { default as MiniPlayer } from './audio/MiniPlayer';
export { default as PlayerControls } from './audio/PlayerControls';

// Video Components
export { default as VideoOverlay } from './video/VideoOverlay';

// Playlist Components
export { default as AddToPlaylistModal } from './playlists/AddToPlaylistModal';
export { default as CreatePlaylistModal } from './playlists/CreatePlaylistModal';
export { default as PlaylistDetail } from './playlists/PlaylistDetail';
export { default as PlaylistList } from './playlists/PlaylistList';

// Media Components
export { default as MediaGrid } from './media/MediaGrid';
export { default as MediaList } from './media/MediaList';
export { default as FolderList } from './media/FolderList';

// UI Components
export { default as CompactSidebar } from './ui/CompactSidebar';
export { default as CustomTabBar } from './ui/CustomTabBar';
export { default as LibraryPanel } from './ui/LibraryPanel';
export { default as LoadingScreen } from './ui/LoadingScreen';
export { default as SettingsModal } from './ui/SettingsModal';

// Exportar tipos si es necesario
export type { default as LoadingScreenProps } from './ui/LoadingScreen';
export type { default as MediaListProps } from './media/MediaList';
export type { default as CustomTabBarProps } from './ui/CustomTabBar';