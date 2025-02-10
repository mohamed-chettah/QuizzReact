import PlayerCircle from "./Ui/PlayerCircle.tsx";
import {useContext, useEffect, useRef, useState} from "react";
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
    const [displayPlayers, setDisplayPlayers] = useState(false);
    const [panelWaiter, setPanelWaiter] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
    const [playerAnswered, setPlayerAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
    const [partyIsFinish, setPartyIsFinish] = useState(false);

    // @ts-ignore
    const timerRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (!socket || !id) return;

        const handleDisconnect = () => {
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
        if (timerRef.current) clearInterval(timerRef.current); // Nettoie le timer précédent

        setTimer(10);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    // ✅ Gestion de l'événement "game_state" récuperation des datas
    useEffect(() => {
        if (!socket || !id) return;

        const handleGameState = (data: GameData) => {
            setGameData(data);
        };
        subscribeToEvent("game_state", handleGameState);

        subscribeToEvent("questions_party", (data) => {
            setQuestions(data);
        });

        return () => {
            unsubscribeFromEvent("game_state", handleGameState);
        };
    }, [socket, id, subscribeToEvent, unsubscribeFromEvent]);

    // ✅ Envoi de `get_game_state` uniquement une fois
    useEffect(() => {
        if (!socket || !id || gameData) return;
        sendEvent("get_game_state", id);
    }, [socket, id, sendEvent, gameData]);

    // ✅ Envoi de `get_questions` uniquement une fois pour récupérer les questions
    useEffect(() => {
        if (!socket || !id || gameData) return;
        sendEvent("get_questions", id);

        setDisplayPlayers(true);
        setTimeout(() => {
            setDisplayPlayers(false);
            launchTimer()
        }, 3000);
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
            isLastQuestion: currentQuestionIndex === questions.length - 1,
            indexQuestion: currentQuestionIndex
        });
    };

    useEffect(() => {
        if (timer === 0 && !playerAnswered) {
            sendEvent("submit_answer", {
                playerId: localStorage.getItem("id"),
                gameId: id,
                question: questions[currentQuestionIndex - 1],
                answer: null, // Le joueur n'a pas répondu
                timer: 0,
                isPlayer1: player1.id === localStorage.getItem("id"),
                isLastQuestion: currentQuestionIndex === questions.length - 1,
                indexQuestion: currentQuestionIndex
            });

            setPlayerAnswered(true); // Empêche le joueur de répondre après la fin du timer
        }
    }, [timer]);


    useEffect(() => {
        if (!socket) return;

        const handlePlayerScoreResult = (data: any) => {
            if(data){
                if (data.playerId === player1.id) {
                    setPlayer1((prev) => ({
                        ...prev,
                        score: prev.score + data.score
                    }));
                } else {
                    setPlayer2((prev) => ({
                        ...prev,
                        score: prev.score + data.score
                    }));
                }
            }
        };
        subscribeToEvent("player_score_result", handlePlayerScoreResult);

        return () => {
            unsubscribeFromEvent("player_score_result", handlePlayerScoreResult);
        };
    }, [socket, subscribeToEvent, unsubscribeFromEvent, player1.id]);

    useEffect(() => {
        if (currentQuestionIndex <= questions.length) {
            setPanelWaiter(true);
            setTimeout(() => {
                setPanelWaiter(false);
                setPlayerAnswered(false);
                launchTimer();
            }, 2000);
        }

    }, [currentQuestionIndex]);


    // Next question lorsque les 2 ont repondu
    useEffect(() => {

        const finishQuestion = (() => {
            if(currentQuestionIndex === questions.length && !partyIsFinish){
                return;
            }
            setPlayerAnswered(true);
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setPlayerAnswered(false);
            }, 1500)
        })

        subscribeToEvent("next_question", finishQuestion);

        return () => {
            unsubscribeFromEvent("next_question", finishQuestion);
        };
    });

    function endGame(){
        const displayResultParty = (data : {}) => {
            setPartyIsFinish(true);
            console.log(data)
        }
        sendEvent("get_end_game", id);
        subscribeToEvent("game_end", displayResultParty);
        return () => {
            unsubscribeFromEvent("game_end", displayResultParty);
        };
    }

    // Finish game
    useEffect(() => {
        subscribeToEvent("finish_game", endGame);
        return () => {
            unsubscribeFromEvent("finish_game", endGame);
        };
    });

    return (
        <section className="flex items-center flex-col gap-24 p-4 bg-black pb-10 max-w-xl  pt-20">

            {/* Affichage des joueurs avant de commencer */}
            {displayPlayers ? (
                <div className={"w-full"}>
                    <PresentationPlayer player1={player1} player2={player2}/>
                </div>
            ) : (
                <div>

                    {/* Affichage des joueurs et du timer */}
                    <div className="flex justify-center sm:gap-20 gap-3">
                        <PlayerCircle
                            player={{
                                name: player1.username,
                                score: player1.score,
                                image: player1.image || "/default.png"
                            }}
                            reverse={false}
                            isPlayer2={false}
                        />

                        {
                            !partyIsFinish && !panelWaiter ? (
                            <div className="text-blue-400 flex flex-col gap-1 text-center">
                                <p className="sm:text-[10px] text-[8px]">TEMP RESTANT</p>
                                <p className="font-bold">{timer}</p>
                            </div>
                                ) :
                                (
                                    <p></p>
                                )
                        }

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

                    {
                        partyIsFinish ? (
                            <div
                                className="mt-10 p-6 rounded-lg shadow-lg text-center text-white">
                                <p className="text-xl font-semibold">🎉 La partie est terminée !</p>

                                {player1.score === player2.score ? (
                                    <p className="text-lg font-bold mt-3">🤝 C'est une égalité !</p>
                                ) : (
                                    <p className="text-lg font-bold mt-3">
                                        🏆 Le gagnant est{" "}
                                        <span
                                            className="text-yellow-300">{player1.score > player2.score ? player1.username : player2.username}</span>
                                    </p>
                                )}
                            </div>
                        ) : (

                            <div className="relative flex justify-center items-center min-h-[400px]">

                                {panelWaiter ? (
                                    /* Affichage de l'overlay Naruto si panelWaiter est actif */
                                    <div
                                        className="absolute inset-0 flex flex-col gap-2 justify-center items-center bg-black z-50 animate-fadeIn">
                                        <img src="/naruto.jpg" alt="Chargement..." className="mt-10 w-40 h-52"/>

                                        <p className={"text-sm text-white"}> Guess the answer </p>

                                        <p className={"text-xs text-gray-400"}> Naruto </p>


                                        {questions.length == currentQuestionIndex ? (
                                                <p className={"text-md text-[#FB5757] font-semibold"}>
                                                    Question Bonus ! (Les points sont doublés)
                                                </p>
                                            )
                                            :
                                            (
                                                <p></p>
                                            )
                                        }

                                        <p className={"text-4xl text-white font-semibold"}>
                                            ROUND {currentQuestionIndex}
                                        </p>

                                        <p className={"text-xs text-gray-400"}>
                                            {currentQuestionIndex} sur {questions.length}
                                        </p>
                                    </div>
                                ) : (
                                    /* Affichage des questions si panelWaiter est désactivé */
                                    <div className="flex flex-col gap-10 mt-10 text-center">
                                {/* Gestion du chargement des questions */}
                                {questions.length === 0 || questions.length < currentQuestionIndex ? (
                                    <p className="text-white">Chargement des questions...</p>
                                ) : (
                                    <div className="flex flex-col gap-10">
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

                        )
                    }
                </div>
            )}
        </section>
    );
}

export default Game;
