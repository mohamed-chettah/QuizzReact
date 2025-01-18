import { useParams } from 'react-router-dom';
import PlayerCircle from "./Ui/PlayerCircle.tsx";

function Game() {
    const { id } = useParams();

    return (
        <section className={"flex flex-col gap-16 p-4 bg-black "}>
           <div className={"flex gap-20"}>
               <PlayerCircle player={{name: "Mohamed", score: 0, image: "/luffy3.png"}} reverse={false} />

               <div className={"text-blue-400 flex flex-col gap-1"}>
                   <p className={"text-[10px]"}>TEMP RESTANT</p>
                   <p className={"font-bold"}>20</p>
               </div>

               <PlayerCircle player={{name: "Barbe Noire", score: 0, image: "/barbe_noir.jpg"}} reverse={false} />
           </div>
            
            <p className={"question text-4xl text-white text-center"}>
                En quelle année a <br /> été fondé le <br /> premier ordinateur ?
            </p>


            <div className={"flex flex-col text-2xl gap-2"}>
                <button className={"bg-white text-black py-6 px-2 rounded-md"}>1945</button>
                <button className={"bg-white text-black py-6 px-2 rounded-md"}>1950</button>
                <button className={"bg-white text-black py-6 px-2 rounded-md"}>1955</button>
                <button className={"bg-white text-black py-6 px-2 rounded-md"}>1960</button>
            </div>

        </section>
);
}

export default Game;
