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

}

function Ranking() {
    const [gamesOfUser, setGamesOfUser] = useState<Game[]>([]);
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
            } catch (error) {
                console.error("Erreur lors du chargement des jeux:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="ranking-container">
            <h2 className="ranking-title text-semibold my-5">Récapitulatifs des Parties du joueur connecté</h2>
            <table className="ranking-table mt-5">
                <thead>
                <tr>
                    <th>Joueur 1</th>
                    <th>Joueur 2</th>
                    <th>État</th>
                    <th>Score Joueur 1</th>
                    <th>Score Joueur 2</th>
                    <th>Vainqueur</th>
                </tr>
                </thead>
                <tbody>
                {gamesOfUser.map((game) => {
                    const totalPlayer1Points = game.manches.reduce((sum, manche) => sum + (manche.player1Point || 0), 0);
                    const totalPlayer2Points = game.manches.reduce((sum, manche) => sum + (manche.player2Point || 0), 0);
                    return (
                        <tr key={game.id}>
                            <td>{game.player1?.username || "-"}</td>
                            <td>{game.player2?.username || "-"}</td>
                            <td>{game.state}</td>
                            <td>{totalPlayer1Points}</td>
                            <td>{totalPlayer2Points}</td>
                            <td>{game.winner || "-"}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <style>{`
                .ranking-container {
                    text-align: center;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .ranking-title {
                    font-size: 24px;
                    margin-bottom: 15px;
                    color: #333;
                }
                .ranking-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .ranking-table th, .ranking-table td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                }
                .ranking-table th {
                    background: #FB5757;
                    color: #fff;
                    font-weight: bold;
                }
                .ranking-table tr:nth-child(even) {
                    background: #f2f2f2;
                }
            `}</style>
        </div>
    );
}

export default Ranking;
