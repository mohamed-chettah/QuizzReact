
import {io} from "socket.io-client";
import {useEffect, useState} from "react";
import { Manager } from "socket.io-client";

export default function Dashboard() {

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
                console.log(data);
            })

            return () => {
                socket.off('game_created');
            }
        }
    });

    function createRoom() {
        if (socket) {
            socket.emit("create_game", { party: party });
        } else {
            console.error("Socket non initialisé");
        }
    }

    return (
        <div className={"mt-10"}>
            <h1 className={"text-black dark:text-white"}>Dashboard</h1>

            <div className={"p-20"}>
                <h2 className={"text-black dark:text-white"}>QuizzUp</h2>
                <div className={"flex gap-20 dark:text-white text-black"}>
                    <div>
                        <p>Créé une party :</p>
                        <input value={party} // Lier la valeur de l'input au state 'party'
                               onChange={(e) => setParty(e.target.value)} // Mettre à jour le state lorsque l'utilisateur tape
                               type="text" className={"text-black"}  placeholder={"Nom de la party"}/>
                        <button className={"dark:text-black text-white"} onClick={createRoom}>Créer</button>
                    </div>

                    <div >
                        <p>Rejoindre une party :</p>
                        <table >
                            <thead>
                            <tr>
                                <th>Party</th>
                                <th>Créateur</th>
                                <th>Rejoindre</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Party 1</td>
                                <td>John Doe</td>
                                <td><button className={"dark:text-black text-white"}>Rejoindre</button></td>
                            </tr>
                            <tr>
                                <td>Party 2</td>
                                <td>Jane Doe</td>
                                <td><button className={"dark:text-black text-white"}>Rejoindre</button></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}