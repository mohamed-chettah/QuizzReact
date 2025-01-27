import Game from "../models/games.js";
import User from "../models/users.js";

export async function createGame(game) {
	if (!game.player1) {
		return { error: "L'identifiant du joueur est manquant" };
	}
	const datas = await Game.create({ id: game.id, player1Id: game.player1 });
	return { gameId: datas.dataValues.id };
}

export async function getGame(request) {
	const { gameId } = request.params;
	if (!gameId) {
		return {error: "L'identifiant de la partie est manquant"};
	}
	const game = await Game.findByPk(gameId);
	if (!game) {
		return {error: "La partie n'existe pas."};
	}

	return game.dataValues;
}

export async function getGamewithPlayers(request) {
	const { gameId } = request.params;
	if (!gameId) {
		return {error: "L'identifiant de la partie est manquant"};
	}
	const game = await Game.findByPk(gameId, {
		include: [
			{ model: User, as: "player1", attributes: ["id", "username"] },
			{ model: User, as: "player2", attributes: ["id", "username"] },
		],
	});
	if (!game) {
		return {error: "La partie n'existe pas."};
	}

	return game.dataValues;
}

export async function updateGame(request) {
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

	if (action === "finish") {
		return { message: "La partie est terminée." };
	}

	if (!game){
		return null
	}

	return await Game.findOne({
		where: {id: game.id},
		include: [
			{
				model: User, // Assure-toi d'importer ton modèle User
				as: "player1",
				attributes: ["id", "username"] // Sélectionne les champs que tu veux récupérer
			},
			{
				model: User,
				as: "player2",
				attributes: ["id", "username"]
			}
		]
	});
}
