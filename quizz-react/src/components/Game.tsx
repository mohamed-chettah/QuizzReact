import PlayerCircle from "./Ui/PlayerCircle.tsx";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext.tsx";
import {useParams} from "react-router-dom";

export type GameData = {
    player1: {
        id: string;
        username: string;
        score: number;
        image?: string;
    };
    player2: {
        id: string;
        username: string;
        score: number;
        image?: string;
    };
};

function Game() {
    const socket = useSocket();
    const { id } =  useParams<{ id: string }>();



    // États pour stocker la partie et les joueurs
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [player1, setPlayer1] = useState({ id: "", username: "", score: 0, image: "/luffy3.png" });
    const [player2, setPlayer2] = useState({ id: "", username: "", score: 0, image: "/barbe_noir.jpg" });

    // Quand gameData change, on met à jour les joueurs
    useEffect(() => {
        if (!gameData) return;

        const userId = localStorage.getItem("id");
        if (gameData.player1.id === userId) {
            setPlayer1({
                ...gameData.player1,
                image: gameData.player1.image || "/luffy3.png",
            });
            setPlayer2({
                ...gameData.player2,
                image: gameData.player2.image || "/barbe_noir.jpg",
            });
        } else {
            setPlayer1({
                ...gameData.player2,
                image: gameData.player2.image || "/barbe_noir.jpg",
            });
            setPlayer2({
                ...gameData.player1,
                image: gameData.player1.image || "/luffy3.png",
            });
        }
    }, [gameData]); // ✅ Ce useEffect met à jour player1 et player2 quand gameData change

    // Gestion des événements socket.io
    useEffect(() => {
        if (socket) {
            socket.on("game_state", (data: any) => {
                alert("🔹 Game State Event Received:" + data);
                setGameData(data.game);
            })

            // socket.on("error", (data: any) => {
            //     alert("🔴 Error Event Received:" + data)
            // })

            if(id){
                alert("🔹 Emitting get_game_state event : " + id)
                socket.emit("get_game_state", { id });
            }

        }

    }, [id]);

    return (
        <section className="flex flex-col gap-16 p-4 bg-black">
            <p>Name : {player1.username}</p>
            <p>Score : {player1.score}</p>

            <p>Name : {player2.username}</p>
            <p>Score : {player2.score}</p>

            <div className="flex gap-20">
                <PlayerCircle player={{ name: player1.username, score: player1.score, image: player1.image || "/default.png" }} reverse={false} />

                <div className="text-blue-400 flex flex-col gap-1">
                    <p className="text-[10px]">TEMP RESTANT</p>
                    <p className="font-bold">20</p>
                </div>

                <PlayerCircle player={{ name: player2.username, score: player2.score, image: player2.image || "/default.png" }} reverse={false} />
            </div>

            <p className="question text-4xl text-white text-center">
                En quelle année a <br /> été fondé le <br /> premier ordinateur ?
            </p>

            <div className="flex flex-col text-2xl gap-2">
                <button className="bg-white text-black py-6 px-2 rounded-md">1945</button>
                <button className="bg-white text-black py-6 px-2 rounded-md">1950</button>
                <button className="bg-white text-black py-6 px-2 rounded-md">1955</button>
                <button className="bg-white text-black py-6 px-2 rounded-md">1960</button>
            </div>
        </section>
    );
}

export default Game;
