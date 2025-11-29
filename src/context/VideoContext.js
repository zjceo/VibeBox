import React, { createContext, useState, useContext, useRef } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Referencia para guardar la posición actual si es necesario restaurarla
    // aunque el componente Video suele manejar esto si no se desmonta
    const videoRef = useRef(null);

    const playVideo = (video, newPlaylist = []) => {
        setCurrentVideo(video);
        setPlaylist(newPlaylist.length > 0 ? newPlaylist : [video]);
        setIsVisible(true);
        setIsMinimized(false);
    };

    const minimizeVideo = () => {
        setIsMinimized(true);
    };

    const maximizeVideo = () => {
        setIsMinimized(false);
    };

    const closeVideo = () => {
        setIsVisible(false);
        setCurrentVideo(null);
        setIsMinimized(false);
    };

    return (
        <VideoContext.Provider
            value={{
                currentVideo,
                playlist,
                isMinimized,
                isVisible,
                playVideo,
                minimizeVideo,
                maximizeVideo,
                closeVideo,
                setCurrentVideo, // Para cambiar de video dentro del player
            }}
        >
            {children}
        </VideoContext.Provider>
    );
};

export const useVideo = () => useContext(VideoContext);
