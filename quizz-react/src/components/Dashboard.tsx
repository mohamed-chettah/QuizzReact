import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {SocketContext} from "../context/SocketContext.tsx";
import {TrophyIcon} from '@heroicons/react/24/outline'

export default function Dashboard() {
    const navigate = useNavigate();
    const [party, setParty] = useState("");

    const socketContext = useContext(SocketContext);

    if (!socketContext) {
        throw new Error("SocketContext must be used within a SocketProvider");
    }

    const { socket, subscribeToEvent, unsubscribeFromEvent, sendEvent } = socketContext;

    useEffect(() => {
        // Define the handler callbacks:
        const handleGameCreated = (data: any) => {
            navigate(`/waiting/${data.idGame}`);
        };

        const handleGameReady = (data: any) => {
            navigate(`/game/${data.idGame}`);
        };

        const gameFull = () => {
            alert("La partie est pleine");
        }

        const gameNotFound = () => {
            alert("La partie n'existe pas");
        }

        subscribeToEvent("game_created", handleGameCreated);
        subscribeToEvent("game_ready", handleGameReady);
        subscribeToEvent("game_full", gameFull);
        subscribeToEvent("game_not_found", gameNotFound);

        // Cleanup: remove the listeners on unmount or re-render
        return () => {
            unsubscribeFromEvent("game_created", handleGameCreated);
            unsubscribeFromEvent("game_ready", handleGameReady);
            unsubscribeFromEvent("game_full", gameFull);
            unsubscribeFromEvent("game_not_found", gameNotFound);
        };
    }, [socket, navigate]); // <= Add the dependency array

    function createRoom() {
        if (socket) {
            sendEvent("create_game", { idUser: localStorage.getItem("id") });
        }
    }

    function joinRoom() {
        if (party !== "") {
            if (socket) {
                sendEvent("join_game", { idUser: localStorage.getItem("id"), gameId: party });
            }
        }
    }

    function redirectToRanking() {
        navigate("/ranking");
    }

    return (
        <div className={"mt-10"}>
            <h1 className={"text-black dark:text-white font-semibold"}>Naruto</h1>
            <p className={"mt-5 xl:text-sm text-xs text-center text-black dark:text-white mx-auto sm:px-0 px-2"}>Testez vos connaissances sur les personnages, les techniques et les batailles <br /> légendaires du monde des ninjas créé par Masashi Kishimoto !</p>

            <div className={"sm:p-5 p-2 mt-5"}>
                <div className={"flex flex-col gap-10 dark:text-white text-black sm:px-20 px-4"}>

                    <div className={"flex md:flex-row flex-col md:items-start items-center justify-center gap-5"}>
                        <img className="rounded-lg w-[250px] object-cover" src="/naruto.jpg" alt='naruto'/>

                        <div className={"flex-col flex gap-5"}>
                            <button
                                className={"flex gap-1 justify-center xl:flex-row flex-col dark:border-white border-[1px] border-black-400 items-center dark:text-black text-white"}
                                onClick={createRoom}>
                                <img className={"xl:w-12 w-8 "} src="/quizup-logo-removebg-preview.png"/><p
                                className={"xl:text-md text-sm text-black"}>Créer une partie </p>
                            </button>

                            <p>OU</p>

                            <input value={party}
                                   onChange={(e) => setParty(e.target.value)} placeholder={"identifiant de la partie"}
                                   className={"focus:border-blue-400 dark:border-white border-[1px] border-black-400 rounded-lg p-2 text-black"}
                                   type="text"/>

                            <button
                                className={"flex gap-1 justify-center xl:flex-row flex-col dark:border-white border-[1px]  border-black-400  items-center dark:text-black text-white"}
                                onClick={joinRoom}>
                                <img className={"xl:w-12 w-8 "} src="/quizup-logo-removebg-preview.png"/><p
                                className={"xl:text-md text-sm text-gray-800"}>Rejoindre une partie </p>
                            </button>

                            <button onClick={redirectToRanking}
                                className={"flex gap-3 justify-center xl:flex-row flex-col dark:border-white border-[1px]  border-black-400  items-center dark:text-black text-white"}>
                                <TrophyIcon className="text-purple-700 block h-6 w-6" aria-hidden="true"/><p
                                className={"xl:text-md text-sm text-purple-700"}>Classement</p>
                            </button>

                        </div>

                    </div>

                    <div className={"flex sm:flex-row flex-col sm:gap-10 gap-5 justify-center w-full"}>
                        <div className={"flex flex-col gap-3"}>
                            <p className={"dark:text-gray-500 text-[10px]"}>VOTRE NIVEAU</p>
                            <p className={"text-3xl dark:text-white text-black"}>999</p>
                        </div>

                        <hr className={"border-black-400 dark:border-white border-black border-[0.5px] sm:h-20 "}/>

                        <div className={"flex flex-col gap-3"}>
                            <p className={"dark:text-gray-500 text-[10px]"}>ABONNÉS</p>
                            <p className={"text-3xl dark:text-white text-black"}>10000</p>
                        </div>

                        <hr className={"border-black-400 dark:border-white border-black border-[0.5px] sm:h-20 "}/>

                        <div className={"flex flex-col gap-3"}>
                            <p className={"dark:text-gray-500 text-[10px]"}>TITRE SUIVANT NIV.</p>
                            <p className={"text-3xl dark:text-white text-black"}>1200</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}