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
    bonne_reponse: string;
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
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(1);
    const [playerAnswered, setPlayerAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

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
        setPlayerAnswered(true);
        setSelectedAnswer(selectedAnswer); // Stocke la réponse choisie par le joueur
        setCorrectAnswer(questions[currentQuestionIndex - 1].bonne_reponse);
        // Envoyer la réponse au serveur via Socket.IO
        sendEvent("submit_answer", {
            playerId: localStorage.getItem("id"),
            gameId: id,
            question: questions[currentQuestionIndex - 1],
            answer: selectedAnswer,
            timer: timer,
            isPlayer1: player1.id === localStorage.getItem("id"),
            isLastQuestion: currentQuestionIndex === questions.length - 1
        });

    };

    const setColorScore = (
        colorPlayer1: boolean,
        colorPlayer2: boolean,
        isWrongPlayer1: boolean = false,
        isWrongPlayer2: boolean = false,
        reset: boolean = false
    ) => {
        if (reset) {
            document.querySelector(".score-player1")?.classList.remove("text-green-500", "text-red-500");
            document.querySelector(".score-player2")?.classList.remove("text-green-500", "text-red-500");
        }

        if (isWrongPlayer1) {
            document.querySelector(".score-player1")?.classList.add("text-red-500");
        } else if (colorPlayer1) {
            document.querySelector(".score-player1")?.classList.add("text-green-500");
        }

        if (isWrongPlayer2) {
            document.querySelector(".score-player2")?.classList.add("text-red-500");
        } else if (colorPlayer2) {
            document.querySelector(".score-player2")?.classList.add("text-green-500");
        }
    }

    // ✅ Gestion de l'événement "player_score_result"
    // TODO si l'id du joueur est égal à celui de player1, on met à jour le score de player1 et on lui donne ça bonne réponse
    // TODO sinon on met à jour le score de player2 et on lui donne ça bonne réponse et son point
    useEffect(() => {
        if (!socket) return;

        const handlePlayerScoreResult = (data: any) => {
            console.log("🔹 Event player_score_result received:", data);

            if(data){
                // coloré en vert la bonne réponse
                if (data.playerId === player1.id && data.correct) {
                    setColorScore(true, false, false);
                }
                else if (data.playerId === player2.id && data.correct) {
                    setColorScore(false, true, false);
                }

                if (data.playerId === player1.id) {
                    setPlayer1((prev) => ({
                        ...prev,
                        score: prev.score + data.score
                    }));
                    if(data.correct){
                        setColorScore(true, false, false);
                    }
                    else {
                        setColorScore(false, false, true);
                    }
                } else {
                    if(data.correct){
                        setColorScore(false, true, false);
                    }
                    else {
                        setColorScore(false, false, false, true);
                    }
                    setPlayer2((prev) => ({
                        ...prev,
                        score: prev.score + data.score
                    }));
                }
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

        if (currentQuestionIndex < questions.length) {
            if (timer === 0) {
                setpanelWaiter(true);
                setColorScore(false, false, false, false, true)
                setTimeout(() => {
                    setpanelWaiter(false);
                    setPlayerAnswered(false);
                    setcurrentQuestionIndex(currentQuestionIndex + 1);
                    launchTimer()
                }, 2000);
            }
        }
        else {
            // TODO afficher le gagnant
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
                                className="absolute inset-0 flex flex-col gap-3 justify-center items-center bg-black z-50 animate-fadeIn">
                                <img src="/naruto.jpg" alt="Chargement..." className="w-64 h-80"/>

                                <p className={"text-sm text-white"}> Naruto </p>

                                <p className={"text-2xl text-white"}>
                                    Round { currentQuestionIndex + 1 } sur { questions.length }
                                </p>
                            </div>
                        ) : (
                            /* Affichage des questions si panelWaiter est désactivé */
                            <div className="flex flex-col gap-10 mt-10 w-full max-w-3xl text-center">
                                {/* Gestion du chargement des questions */}
                                {questions.length === 0 || questions.length <= currentQuestionIndex? (
                                    <p className="text-white">Chargement des questions...</p>
                                ) : (
                                    <div className="flex flex-col gap-10">
                                        {/* Affichage de la question */}
                                        <p className="question text-4xl text-white">
                                            {questions[currentQuestionIndex - 1].labelQuestion}
                                        </p>

                                        {/* Boutons de réponse */}
                                        <div className="flex flex-col text-2xl gap-4">
                                            {[questions[currentQuestionIndex - 1].rep1,
                                                questions[currentQuestionIndex - 1].rep2,
                                                questions[currentQuestionIndex - 1].rep3,
                                                questions[currentQuestionIndex - 1].rep4].map((rep, index) => (
                                                <button
                                                    key={index}
                                                    disabled={playerAnswered} // Désactive après réponse
                                                    className={`btn-reponse transition duration-300 hover:bg-gray-700
                                                    ${playerAnswered && rep === correctAnswer ? "bg-green-500 text-white" : ""}
                                                    ${playerAnswered && rep === selectedAnswer && rep !== correctAnswer ? "bg-red-500 text-white" : ""}
                                                     `}
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
