
import {io} from "socket.io-client";

export default function Dashboard() {

    const socket = io('http://localhost:3000');
    socket.emit( "test", 'test');
    return (
        <div className={"mt-10"}>
            <h1 className={"text-black dark:text-white"}>Dashboard</h1>

            <div className={"p-20"}>
                <h2 className={"text-black dark:text-white"}>QuizzUp</h2>
                <div>
                    <button>Créer un quizz</button>
                    <button>Rejoindre un quizz</button>
                </div>
            </div>
        </div>
    )
}