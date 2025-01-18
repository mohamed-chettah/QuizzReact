import { useParams } from 'react-router-dom';
import { useState } from 'react';

function WaitingParty() {
    const { id } = useParams();
    const [buttonText, setButtonText] = useState('Copier');

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
                <div className="flex justify-center items-center">
                    <img src="/big-logo.png" className="w-40"/>
                </div>
                <h2 className="text-2xl mt-5 font-semibold mb-6 text-center">Salle d'attente</h2>
                <p className="text-lg mb-4 text-center">ID de la partie à envoyer à ton futur adversaire :</p>
                <div className="flex flex-col items-center gap-4">
                    <span className="font-mono text-2xl bg-white dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-40 rounded px-4 py-2">
                        {id}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold
                                   hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all duration-300 ease-in-out
                                   transform hover:scale-105 focus:outline-none focus:ring-2
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