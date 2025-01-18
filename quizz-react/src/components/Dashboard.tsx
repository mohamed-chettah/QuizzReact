import {io} from "socket.io-client";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const [party, setParty] = useState("");
    const [socket, setSocket] = useState(null); // State pour stocker l'instance de socket

    // Initialiser la connexion une seule fois au montage du composant
    useEffect(() => {
        const newSocket : any = io("http://localhost:3000"); // Initialiser la connexion Socket.IO
        setSocket(newSocket); // Stocker l'instance dans le state

        // Nettoyer la connexion lorsque le composant est démonté
        return () => {
            newSocket.disconnect();
        };
    }, []); // Le tableau vide [] garantit que le code ne s'exécute qu'une seule fois

    useEffect(() => {
        if (socket) {
            socket.on('game_created', (data: any) => {
                navigate(`/waiting/${data.idGame}`);
            })

            socket.on('game_ready', (data: any) => {
                navigate(`/waiting/${data.idGame}`);
            })
            return () => {
                socket.off('game_created');
            }
        }
    });

    function createRoom() {
        if (socket) {
            socket.emit("create_game", { idUser : localStorage.getItem('id')});
        } else {
            console.error("Socket non initialisé");
        }
    }

    function joinRoom() {
        if (socket) {
            socket.emit("join_game", { idUser : localStorage.getItem('id'), gameId : party });
            console.log(party);
        } else {
            console.error("Socket non initialisé");
        }
    }

    return (
        <div className={"mt-10"}>
            <h1 className={"text-black dark:text-white"}>Naruto</h1>
            <p className={"mt-5 xl:text-sm text-xs text-center text-black dark:text-white"}>Testez vos connaissances sur les personnages, les techniques et les batailles <br /> légendaires du monde des ninjas créé par Masashi Kishimoto !</p>

            <div className={"p-5 mt-5"}>
                <div className={"flex flex-col gap-20 dark:text-white text-black px-20"}>

                    <div className={"flex justify-center gap-5"}>
                        <img className="rounded-lg xl:w-[250px] w-[150px] object-cover" src="/naruto.jpg" alt='naruto'/>

                        <div className={"flex-col flex gap-5"}>
                            <button
                                className={"flex gap-1 xl:flex-row flex-col dark:border-white border-[1px] border-black-400 items-center dark:text-black text-white"}
                                onClick={createRoom}>
                                <img className={"xl:w-12 w-8 "} src="/quizup-logo-removebg-preview.png"/><p
                                className={"xl:text-md text-sm text-black"}>Créer une partie </p>
                            </button>

                            <p>OU</p>

                            <input value={party}
                                   onChange={(e) => setParty(e.target.value)} placeholder={"id de la partie"} className={"focus:border-blue-400 dark:border-white border-[1px]  border-black-400  rounded-lg p-2 text-black"} type="text" />

                            <button
                                className={"flex gap-1 xl:flex-row flex-col dark:border-white border-[1px]  border-black-400  items-center dark:text-black text-white"}
                                onClick={joinRoom}>
                                <img className={"xl:w-12 w-8 "} src="/quizup-logo-removebg-preview.png"/><p
                                className={"xl:text-md text-sm text-black"}>Rejoindre une partie </p>
                            </button>

                        </div>

                    </div>

                    {/* Image + input et champ rejoindre party */}

                    {/* Créé party */}

                    {/* Classement - Recap des match jouer */}

                    {/*<div>*/}
                    {/*    <h3 className={"font-bold"}>Classement Party :</h3>*/}
                    {/*    <table className={"mt-5"}>*/}
                    {/*        <thead>*/}
                    {/*        <tr>*/}
                    {/*            <th>Party</th>*/}
                    {/*            <th>Créateur</th>*/}
                    {/*            <th>Rejoindre</th>*/}
                    {/*        </tr>*/}
                    {/*        </thead>*/}
                    {/*        <tbody>*/}
                    {/*        <tr>*/}
                    {/*            <td>Party 1</td>*/}
                    {/*            <td>John Doe</td>*/}
                    {/*            <td><button className={"dark:text-black text-white"}>Rejoindre</button></td>*/}
                    {/*        </tr>*/}
                    {/*        <tr>*/}
                    {/*            <td>Party 2</td>*/}
                    {/*            <td>Jane Doe</td>*/}
                    {/*            <td><button className={"dark:text-black text-white"}>Rejoindre</button></td>*/}
                    {/*        </tr>*/}
                    {/*        </tbody>*/}
                    {/*    </table>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    )
}