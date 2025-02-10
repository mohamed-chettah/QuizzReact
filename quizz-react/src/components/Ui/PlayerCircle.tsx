type Player = {
    name: string;
    score: number;
    image: string;
};

function PlayerCircle(props: { player: Player; reverse: boolean, isPlayer2?: boolean}) {
    return (
        <div
            className={`flex text-white gap-4 ${props.reverse ? "flex-row-reverse" : "flex-row"}`}
        >
            <img className="sm:w-12 w-8 sm:h-12 h-8 rounded-full object-cover" src={props.player.image} alt={props.player.name} />
            <div className="flex flex-col items-start gap-1">
                <div className="player-circle__name sm:text-sm text-xs">{props.player.name}</div>
                <div className={`text-yellow-300 text-xl ${props.isPlayer2 ? "score-player2" : "score-player1"}`}>{props.player.score}</div>
            </div>
        </div>
    );
}

export default PlayerCircle;
