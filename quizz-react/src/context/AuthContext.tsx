import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Définition du type pour le contexte
interface AuthContextType {
    isAuthenticated: boolean;
    login: (userDatas: ILoginUserInput) => Promise<void>;
    logout: () => void;
    registerUser: (userDatas: IRegisterUserInput) => Promise<void>;
}

interface IRegisterUserInput {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}

interface ILoginUserInput {
    email: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Vérifier s'il y a un token stocké pour initialiser l'état
        return !!localStorage.getItem('token');
    });

    // Utilisation de useEffect pour vérifier l'état de isAuthenticated à chaque fois que le composant est monté
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []); // [] assure que cela ne se produira qu'au premier rendu

    // Fonction pour le login
    const login = async (userDatas: ILoginUserInput) => {
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + 'login', userDatas );

            if (response.data.error) {
                throw new Error(response.data.error); // Lever une erreur avec le message du serveur
            }

            // Vérifier que le serveur renvoie bien un token avant de continuer
            else if (response.status === 200 && response.data) {
                const {token, username, id} = response.data;
                if (!token) {
                    throw new Error("Invalid token");
                }
                localStorage.setItem('token', token);
                localStorage.setItem('username', username);
                localStorage.setItem('id', id);
                setIsAuthenticated(true);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            console.log('Error captured in login function:', error); // Ajouter un log pour vérifier l'erreur
            throw new Error(error.response?.data?.error || error.message || "Failed to login");
        }
    };

    // Fonction pour le logout
    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    // Fonction pour l'enregistrement d'un utilisateur
    const registerUser = async (userDatas: IRegisterUserInput) => {
        try {
            const response = await axios.post( import.meta.env.VITE_API_URL + 'register', userDatas);

            // Vérifier si la réponse contient une erreur, même si le statut HTTP est 200
            if (response.data.error) {
                throw new Error(response.data.error);
            }
        } catch (error : unknown) {
            if (error instanceof ErrorEvent) {
                console.error("Erreur lors de l'inscription", error);
                throw new Error(error.message || "Failed to register");
            }
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, registerUser }}>
            {children}
        </AuthContext.Provider>
    );
};
