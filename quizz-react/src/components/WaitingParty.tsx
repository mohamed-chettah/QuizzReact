import {useNavigate, useParams} from 'react-router-dom';
import {useContext, useEffect, useState} from 'react';
import {SocketContext} from "../context/SocketContext.tsx";

function WaitingParty() {
    const { id } =  useParams<{ id: string }>();
    const [buttonText, setButtonText] = useState('Copier');
    const socketContext = useContext(SocketContext);

    if (!socketContext) {
        throw new Error("SocketContext must be used within a SocketProvider");
    }

    const { socket, subscribeToEvent } = socketContext;
    const navigate = useNavigate()

    // Si joiningParty on lance la partie sur les deux clients
    useEffect(() => {
        if (socket) {
            subscribeToEvent("game_ready", (data: any) => {
                navigate(`/game/${data.idGame}`);
            })
        }
    });

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
        <section className="flex items-center justify-center text-gray-900 dark:text-white p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 bg-opacity-10 dark:bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-md w-full">
                <h2 className="text-2xl mt-5 font-semibold mb-6 text-center">Salle d'attente</h2>
                <p className="text-lg mb-4 text-center">ID de la partie à envoyer à ton futur adversaire :</p>
                <div className="flex flex-col items-center gap-4">
                    <span className="font-mono text-2xl bg-white dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-40 rounded px-4 py-2">
                        {id}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="w-full px-6 py-3 bg-[#FB5757] hover:bg-[#FB5757]/80  text-white rounded-lg font-semibold
                                   transition-all duration-300 ease-in-out
                                   transform focus:outline-none focus:ring-2
                                   focus:ring-indigo-400 focus:ring-opacity-50"
                    >
                        {buttonText}
                    </button>
                </div>
                <p className="mt-6 text-center text-sm opacity-75">
                    En attente d'un adversaire...
                </p>
            </div>
        </section>
    );
}

export default WaitingParty;
