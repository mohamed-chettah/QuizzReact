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

export type Question = {
    id: string
    labelQuestion: string;
    rep1: string;
    rep2: string;
    rep3: string;
    rep4: string;
    bonneReponse: string;
    photo?: string;
};

function Game() {
    const socketContext = useContext(SocketContext);

    if (!socketContext) {
        throw new Error("SocketContext must be used within a SocketProvider");
    }

    const {socket, subscribeToEvent, unsubscribeFromEvent, sendEvent} = socketContext;
    const {id} = useParams<{ id: string }>();

    // États pour stocker la partie et les joueurs
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [player1, setPlayer1] = useState({
        id: "",
        username: "",
        score: 0,
        image: "/luffy3.png",
        bg: "/luffy-crew.webp"
    });
    const [player2, setPlayer2] = useState({
        id: "",
        username: "",
        score: 0,
        image: "/barbe_noir.jpg",
        bg: "/prime-barbe-noir.webp"
    });
    const [questions, setQuestions] = useState([] as Question[]);
    const [timer, setTimer] = useState(10);
    const [displayPlayers, setdisplayPlayers] = useState(false);
    const [panelWaiter, setpanelWaiter] = useState(false);
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (!socket || !id) return;

        const handleDisconnect = () => {
            console.log("🚪 Déconnexion du joueur (page rechargée)");
            sendEvent("disconnect", { userId: localStorage.getItem("id"), gameId: id });
        };

        // Écoute le rechargement de la page
        window.addEventListener("beforeunload", handleDisconnect);

        return () => {
            window.removeEventListener("beforeunload", handleDisconnect);
        };
    }, [socket, id, sendEvent]);


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

        if (questions.length < 0) return;


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

        console.log("🔹 Emitting get_game_state event:", {id});
        sendEvent("get_game_state", id);
    }, [socket, id, sendEvent, gameData]);

    // ✅ Envoi de `get_questions` uniquement une fois pour récupérer les questions
    useEffect(() => {
        if (!socket || !id || gameData) return;
        console.log("🔹 Emitting get_questions event:", {id});
        sendEvent("get_questions", id);

        setdisplayPlayers(true);
        setTimeout(() => {
            setdisplayPlayers(false);
            launchTimer()
        }, 5000);
    }, [socket, id, sendEvent, gameData]);

    // ✅ Gestion de la réponse à une question
    const handleAnswer = (selectedAnswer: string) => {
        console.log("📤 Réponse soumise:", selectedAnswer);

        // Envoyer la réponse au serveur via Socket.IO
        sendEvent("submit_answer", {
            userId: localStorage.getItem("id"),
            gameId: id,
            question: questions[currentQuestionIndex],
            answer: selectedAnswer,
            timer: timer
        });


        // On affiche le panel de chargement à la fin du temp alloué pour répondre

        // Passer à la question suivante après 2s (simule une attente de validation)

    };

    const setColorScore = (colorPlayer1 : boolean, colorPlayer2 : boolean, reset : boolean = false) => {
        if (reset) {
            document.querySelector(".score-player1")?.classList.remove("bg-green-500");
            document.querySelector(".score-player2")?.classList.remove("bg-green-500");
        }

        if (colorPlayer1) {
            document.querySelector(".score-player1")?.classList.add("bg-green-500");
        } else if (colorPlayer2) {
            document.querySelector(".score-player2")?.classList.add("bg-green-500");
        }
    }


    // ✅ Gestion de l'événement "player_score_result"
    // TODO si l'id du joueur est égal à celui de player1, on met à jour le score de player1 et on lui donne ça bonne réponse
    // TODO sinon on met à jour le score de player2 et on lui donne ça bonne réponse et son point
    useEffect(() => {
        if (!socket) return;

        const handlePlayerScoreResult = (data: any) => {
            console.log("🔹 Event player_score_result received:", data);

            // coloré en vert la bonne réponse
            if (data.idPlayer === player1.id) {
                setColorScore(true, false, false);
            }

            if (data.idPlayer === player1.id) {
                setPlayer1((prev) => ({
                    ...prev,
                    score: prev.score + data.point
                }));
            } else {
                setPlayer2((prev) => ({
                    ...prev,
                    score: prev.score + data.point
                }));
            }

        };

        subscribeToEvent("player_score_result", handlePlayerScoreResult);

        return () => {
            console.log("🔴 Unsubscribing from player_score_result event");
            unsubscribeFromEvent("player_score_result", handlePlayerScoreResult);
        };
    }, [socket, subscribeToEvent, unsubscribeFromEvent, player1.id]);



    // Mettre un watcher pour sur timer lorsqu'il est a zero
    useEffect(() => {
        if (timer === 0) {
            setpanelWaiter(true);
            setTimeout(() => {
                setpanelWaiter(false);
                setcurrentQuestionIndex(currentQuestionIndex + 1);
                launchTimer()
            }, 2000);
        }
    }, [timer]);



    return (
        <section className="flex flex-col gap-16 p-4 bg-black min-h-screen">

            {/* Affichage des joueurs avant de commencer */}
            {displayPlayers ? (
                <div>
                    <PresentationPlayer player1={player1} player2={player2}/>
                </div>
            ) : (
                <div>

                    {/* Affichage des joueurs et du timer */}
                    <div className="flex justify-center gap-20">
                        <PlayerCircle
                            player={{
                                name: player1.username,
                                score: player1.score,
                                image: player1.image || "/default.png"
                            }}
                            reverse={false}
                            isPlayer2={false}
                        />

                        <div className="text-blue-400 flex flex-col gap-1 text-center">
                            <p className="text-[10px]">TEMP RESTANT</p>
                            <p className="font-bold">{timer}</p>
                        </div>

                        <PlayerCircle
                            player={{
                                name: player2.username,
                                score: player2.score,
                                image: player2.image || "/default.png",
                            }}
                            reverse={false}
                            isPlayer2={true}
                        />
                    </div>

                    {/* Conteneur des questions avec animation de Naruto en overlay */}
                    <div className="relative w-full flex justify-center items-center min-h-[400px]">

                        {panelWaiter ? (
                            /* Affichage de l'overlay Naruto si panelWaiter est actif */
                            <div
                                className="absolute inset-0 flex justify-center items-center bg-black z-50 animate-fadeIn">
                                <img src="/naruto.jpg" alt="Chargement..." className="w-64 h-64"/>
                            </div>
                        ) : (
                            /* Affichage des questions si panelWaiter est désactivé */
                            <div className="flex flex-col gap-10 mt-10 w-full max-w-3xl text-center">
                                {/* Gestion du chargement des questions */}
                                {questions.length === 0 ? (
                                    <p className="text-white">Chargement des questions...</p>
                                ) : (
                                    <div className="flex flex-col gap-10">
                                        {/* Affichage de la question */}
                                        <p className="question text-4xl text-white">
                                            {questions[currentQuestionIndex].labelQuestion}
                                        </p>

                                        {/* Boutons de réponse */}
                                        <div className="flex flex-col text-2xl gap-4">
                                            {[questions[currentQuestionIndex].rep1,
                                                questions[currentQuestionIndex].rep2,
                                                questions[currentQuestionIndex].rep3,
                                                questions[currentQuestionIndex].rep4].map((rep, index) => (
                                                <button
                                                    key={index}
                                                    className="btn-reponse transition duration-300 hover:bg-gray-700"
                                                    onClick={() => handleAnswer(rep)}
                                                >
                                                    {rep}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </section>
    );
}
export default Game;
