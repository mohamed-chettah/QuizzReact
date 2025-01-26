import PlayerCircle from "./Ui/PlayerCircle.tsx";
import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../context/SocketContext.tsx";
import {useParams} from "react-router-dom";
import PresentationPlayer from "./Ui/PresentationPlayer.tsx";

export type GameData = {
    player1: {
        id: string;
        username: string;
        score: number;
        image?: string;
        bg?: string;
    };
    player2: {
        id: string;
        username: string;
        score: number;
        image?: string;
        bg?: string;
    };
};

function Game() {
    const socketContext = useContext(SocketContext);

    if (!socketContext) {
        throw new Error("SocketContext must be used within a SocketProvider");
    }

    const { socket, subscribeToEvent, unsubscribeFromEvent, sendEvent } = socketContext;
    const { id } =  useParams<{ id: string }>();

    // États pour stocker la partie et les joueurs
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [player1, setPlayer1] = useState({ id: "", username: "", score: 0, image: "/luffy3.png", bg : "/luffy-crew.webp"});
    const [player2, setPlayer2] = useState({ id: "", username: "", score: 0, image: "/barbe_noir.jpg", bg : "/prime-barbe-noir.webp"});
    const [questions, setQuestions] = useState([]);
    const [timer, setTimer] = useState(10);
    const [displayPlayers, setdisplayPlayers] = useState(false);

    // Quand gameData change, on met à jour les joueurs
    useEffect(() => {
        if (!gameData) return;

        const userId = localStorage.getItem("id");

        if (gameData.player1.id === userId) {
            setPlayer1({
                ...gameData.player1,
                score: 0,
                image: gameData.player1.image || "/luffy3.png",
                bg: gameData.player1.bg || "/luffy-crew.webp"
            });
            setPlayer2({
                ...gameData.player2,
                score: 0,
                image: gameData.player2.image || "/barbe_noir.jpg",
                bg: gameData.player2.bg || "/prime-barbe-noir.webp"
            });
        } else {
            setPlayer1({
                ...gameData.player2,
                score: 0,
                image: gameData.player2.image || "/barbe_noir.jpg",
                bg: gameData.player2.bg || "/prime-barbe-noir.webp"
            });
            setPlayer2({
                ...gameData.player1,
                score: 0,
                image: gameData.player1.image || "/luffy3.png",
                bg: gameData.player1.bg || "/luffy-crew.webp"
            });
        }

        if (questions.length < 0 ) return;


    }, [gameData]); // ✅ Ce useEffect met à jour player1 et player2 quand gameData change

    function launchTimer() {
        let time = 10;
        const interval = setInterval(() => {
            time--;
            setTimer(time);
            if (time === 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    // ✅ Gestion de l'événement "game_state" récuperation des datas
    useEffect(() => {
        if (!socket || !id) return;

        const handleGameState = (data: GameData) => {
            console.log("🔹 Event game_state received:", data);
            setGameData(data);
        };
        subscribeToEvent("game_state", handleGameState);

        subscribeToEvent("questions_party", (data) => {
            console.log("🔹 Event questions received:", data);
            setQuestions(data);
        });

        return () => {
            console.log("🔴 Unsubscribing from game_state event");
            unsubscribeFromEvent("game_state", handleGameState);
        };
    }, [socket, id, subscribeToEvent, unsubscribeFromEvent]);

    // ✅ Envoi de `get_game_state` uniquement une fois
    useEffect(() => {
        if (!socket || !id || gameData) return;

        console.log("🔹 Emitting get_game_state event:", {  id });
        sendEvent("get_game_state", id);
    }, [socket, id, sendEvent, gameData]);

    // ✅ Envoi de `get_questions` uniquement une fois pour récupérer les questions
    useEffect(() => {
        if (!socket || !id || gameData) return;
        console.log("🔹 Emitting get_questions event:", {  id });
        sendEvent("get_questions", id);

        setdisplayPlayers(true);
        setTimeout(() => {
            setdisplayPlayers(false);
            launchTimer()
        }, 5000);
    }, [socket, id, sendEvent, gameData]);

    return (
        <section className="flex flex-col gap-16 p-4 bg-black">

            {
                displayPlayers  ? (
                    <div>
                        <PresentationPlayer player1={player1} player2={player2} />
                    </div>
                ) : (
                        <div>

                            <div className="flex justify-center gap-20">
                                <PlayerCircle
                                    player={{
                                        name: player1.username,
                                        score: player1.score,
                                        image: player1.image || "/default.png"
                                    }}
                                    reverse={false}/>

                                <div className="text-blue-400 flex flex-col gap-1">
                                    <p className="text-[10px]">TEMP RESTANT</p>
                                    <p className="font-bold">{timer}</p>
                                </div>

                                <PlayerCircle
                                    player={{
                                        name: player2.username,
                                        score: player2.score,
                                        image: player2.image || "/default.png"
                                    }}
                                    reverse={false}/>
                            </div>


                            <div>
                                {questions.length == 0 ? (
                                    <div>
                                        <p className={"text-white"}>Chargement des questions...</p>
                                    </div>

                                ) : (
                                    <div className={"flex flex-col gap-10 mt-10 "}>
                                        <p className="question text-4xl text-white text-center">
                                            En quelle année a <br/> été fondé le <br/> premier ordinateur ?
                                        </p>

                                        <div className="flex flex-col text-2xl gap-2">
                                            <button className="bg-white text-black py-6 px-2 rounded-md">1945</button>
                                            <button className="bg-white text-black py-6 px-2 rounded-md">1950</button>
                                            <button className="bg-white text-black py-6 px-2 rounded-md">1955</button>
                                            <button className="bg-white text-black py-6 px-2 rounded-md">1960</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        )
                        }


                    </section>
                );
            }

            export default Game;
