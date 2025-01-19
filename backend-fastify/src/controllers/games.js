import Game from "../models/games.js";

export async function createGame(game) {
	if (!game.player1) {
		return { error: "L'identifiant du joueur est manquant" };
	}
	const datas = await Game.create({ id: game.id, player1Id: game.player1 });
	return { gameId: datas.dataValues.id };
}

export async function getGame(request) {
	const { gameId } = request.params;
	console.log("getGame", gameId);
	if (!gameId) {
		return {error: "L'identifiant de la partie est manquant"};
	}
	const game = await Game.findByPk(gameId);
	if (!game) {
		return {error: "La partie n'existe pas."};
	}

	return game.dataValues;
}

export async function updateGame(request) {
	console.log("updateGame", request);
	const { action, gameId } = request.params;
	 if (!gameId) {
		return { error: "L'identifiant de la partie est manquant" };
	}
	const game = await Game.findByPk(gameId);
	if (!game) {
		return { error: "La partie n'existe pas." };
	}

	if (game.dataValues.state === "finished") {
		return { error: "Cette partie est déjà terminée !" };
	}

	console.log("action", action);
	switch (action) {
		case "join":
			if (game.dataValues.player != null) {
				return { error: "Il y a déjà 2 joueurs dans cette partie !" };
			}
			if (game.dataValues.state !== "pending") {
				return { error: "Cette partie n'est plus en attente." };
			}
			game.player2Id = request.body.player2;
			game.state = "playing";
			break;
		case "finish":
			game.state = "finished";
			if (!request.body.score) {
				return { error: "Le score est manquant." };
			}
			game.winnerScore = request.body.score;
			game.winner = request.body.winner;
			break;
		default:
			return { error: "Action inconnue" };
	}

	await game.save();
	return game;
}
