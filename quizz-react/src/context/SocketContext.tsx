import { createContext, useContext, useEffect, useState } from 'react';
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
        const newSocket : any = io('http://localhost:3000');
        setSocket(newSocket);

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
