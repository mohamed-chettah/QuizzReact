import { useParams } from 'react-router-dom';

function Game() {
    const { id } = useParams();

    return (
        <div>
            <h1>Page de Jeu</h1>
            <p>Paramètre ID : {id}</p>
        </div>
);
}

export default Game;
