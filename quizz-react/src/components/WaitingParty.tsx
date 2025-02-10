import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from "../context/SocketContext.tsx";

function WaitingParty() {
    const { id } = useParams<{ id: string }>();
    const [buttonText, setButtonText] = useState('Copier');
    const socketContext = useContext(SocketContext);

    if (!socketContext) {
        throw new Error("SocketContext must be used within a SocketProvider");
    }

    const { socket, subscribeToEvent } = socketContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            subscribeToEvent("game_ready", (data: any) => {
                navigate(`/game/${data.idGame}`);
            });
        }
    }, [socket, subscribeToEvent, navigate]); // Ajout de dépendances pour éviter les effets multiples

    const copyToClipboard = () => {
        if (id) {
            navigator.clipboard.writeText(id).then(() => {
                setButtonText('Copié !');
                setTimeout(() => setButtonText('Copier'), 2000);
            }).catch(err => {
                console.error('Erreur lors de la copie :', err);
                setButtonText('Erreur');
            });
        }
    };

    return (
        <section className="flex items-center justify-center mt-10 p-4 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 bg-opacity-10 dark:bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl p-2 sm:p-8 shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                    Salle d'attente
                </h2>
                <p className="text-sm sm:text-lg text-center mb-3 sm:mb-4">
                    ID de la partie à envoyer à ton futur adversaire :
                </p>
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <span className="font-mono text-lg sm:text-2xl bg-white dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-40 rounded px-3 sm:px-4 py-2">
                        {id}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="sm:w-full w-1/2 px-0 sm:px-6 py-2 sm:py-3 bg-[#FB5757] hover:bg-[#FB5757]/80
                                   text-white rounded-lg font-semibold transition-all duration-300
                                   ease-in-out transform focus:outline-none focus:ring-2
                                   focus:ring-red-400 focus:ring-opacity-50"
                    >
                        {buttonText}
                    </button>
                </div>
                <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm opacity-75">
                    En attente d'un adversaire...
                </p>
            </div>
        </section>
    );
}

export default WaitingParty;
