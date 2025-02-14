import axios from "axios";
import { useEffect, useState } from "react";

export type Game = {
    id: number;
    player1: {
        id: number;
        username: string;
    };
    player2: {
        id: number;
        username: string;
    };
    state: string;
    manches: {
        player1Point: number;
        player2Point: number;
    }[];
    winner: string;
};

function Ranking() {
    const [gamesOfUser, setGamesOfUser] = useState<Game[]>([]);
    const [gamesOfAllUser, setGamesOfAllUser] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let idUser = localStorage.getItem("id");
                if (!idUser) {
                    return;
                }
                const response = await axios.get(import.meta.env.VITE_API_URL + 'games/' + idUser);
                setGamesOfUser(response.data);
                const listAllGame = await axios.get(import.meta.env.VITE_API_URL + 'games');
                setGamesOfAllUser(listAllGame.data);
            } catch (error) {
                console.error("Erreur lors du chargement des jeux:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p className="text-gray-200 text-center">Chargement...</p>;
    }

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-5">Récapitulatif Global de toutes les parties jouées et terminées :</h2>
            {gamesOfAllUser.length === 0 ? (
                <p className="text-gray-400">Aucune partie n'a été jouée pour le moment.</p>
            ) : (
                <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-red-600 text-white">
                        <th className="p-3">Joueur 1</th>
                        <th className="p-3">Joueur 2</th>
                        <th className="p-3">État</th>
                        <th className="p-3">Score Joueur 1</th>
                        <th className="p-3">Score Joueur 2</th>
                        <th className="p-3">Vainqueur</th>
                    </tr>
                    </thead>
                    <tbody>
                    {gamesOfAllUser.map((game) => {
                        const totalPlayer1Points = game.manches.reduce((sum, manche) => sum + (manche.player1Point || 0), 0);
                        const totalPlayer2Points = game.manches.reduce((sum, manche) => sum + (manche.player2Point || 0), 0);
                        return (
                            <tr key={game.id} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                                <td className="p-3 text-center">{game.player1?.username || "-"}</td>
                                <td className="p-3 text-center">{game.player2?.username || "-"}</td>
                                <td className="p-3 text-center">{game.state}</td>
                                <td className="p-3 text-center">{totalPlayer1Points}</td>
                                <td className="p-3 text-center">{totalPlayer2Points}</td>
                                <td className="p-3 text-center">{game.winner || "Égalité"}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}

            <h2 className="text-xl font-semibold my-5">Récapitulatif des Parties du joueur connecté :</h2>
            <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                <thead>
                <tr className="bg-red-600 text-white">
                    <th className="p-3">Joueur 1</th>
                    <th className="p-3">Joueur 2</th>
                    <th className="p-3">État</th>
                    <th className="p-3">Score Joueur 1</th>
                    <th className="p-3">Score Joueur 2</th>
                    <th className="p-3">Vainqueur</th>
                </tr>
                </thead>
                <tbody>
                {gamesOfUser.map((game) => {
                    const totalPlayer1Points = game.manches.reduce((sum, manche) => sum + (manche.player1Point || 0), 0);
                    const totalPlayer2Points = game.manches.reduce((sum, manche) => sum + (manche.player2Point || 0), 0);
                    return (
                        <tr key={game.id} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                            <td className="p-3 text-center">{game.player1?.username || "-"}</td>
                            <td className="p-3 text-center">{game.player2?.username || "-"}</td>
                            <td className="p-3 text-center">{game.state}</td>
                            <td className="p-3 text-center">{totalPlayer1Points}</td>
                            <td className="p-3 text-center">{totalPlayer2Points}</td>
                            <td className="p-3 text-center">{game.winner || "Égalité"}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default Ranking;
