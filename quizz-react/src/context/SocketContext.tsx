import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import { io, Socket } from "socket.io-client";
import {useNavigate} from "react-router-dom";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    loading: boolean;
    error: string | null;
    subscribeToEvent: (event: string, callback: (data: any) => void) => void;
    unsubscribeFromEvent: (event: string, callback: (data: any) => void) => void;
    joinRoom: (gameId: string) => void;
    sendEvent: (event: string, data: any) => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    //TODO pour la prod changer l'url

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL);

        newSocket.on("connect", () => {
            setIsConnected(true);
            setLoading(false);
        });

        newSocket.on("connect_error", (err: any) => {
            setError(`Erreur de connexion: ${err.message}`);
            setLoading(false);
        });


        subscribeToEvent("error", (data: any) => {
            alert("🔴 Error Event Received:" + data)
            navigate('/dashboard');
        })

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []); // Dépendance vide pour ne s'exécuter qu'au montage

    const joinRoom = useCallback((gameId: string) => {
        if (socket && isConnected) {
            socket.emit("join-game", gameId);
        }
    }, [socket, isConnected]);

    const sendEvent = useCallback((event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            setError("Impossible d'envoyer l'événement : Socket non connecté.");
        }
    }, [socket, isConnected]);

    const subscribeToEvent = useCallback((event: string, callback: (data: any) => void) => {
        if (socket) {
            socket.on(event, callback);
        }
    }, [socket]);

    const unsubscribeFromEvent = useCallback((event: string, callback: (data: any) => void) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    const contextValue: SocketContextType = useMemo(() => ({
        socket,
        isConnected,
        loading,
        error,
        subscribeToEvent,
        unsubscribeFromEvent,
        joinRoom,
        sendEvent,
    }), [socket, isConnected, loading, error]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};


export const useSocket = () => useContext(SocketContext);
