import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Créer le contexte
const SocketContext = createContext(null);

// Hook pour accéder facilement au contexte
export const useSocket = () => {
    return useContext(SocketContext);
};

// Composant Provider pour encapsuler l'application et partager le socket
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialiser le socket uniquement une fois lors du montage du composant
        const newSocket = io('http://localhost:3000'); // Remplace avec l'URL de ton serveur socket
        setSocket(newSocket);

        // Nettoyage lors du démontage du composant
        return () => newSocket.close();
    }, []);

    if (!socket) {
        return <div>Connexion au serveur...</div>;
    }

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
