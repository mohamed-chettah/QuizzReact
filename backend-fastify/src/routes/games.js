import { createGame, updateGame, findGamesByUserId} from "../controllers/games.js";
import games from "../models/games.js";
export function gamesRoutes(app) {
	// Liste des parties actives
	app.get("/games", async (request, reply) => {
		reply.send(games);
	});

	// Liste des parties par joueur (id)
	app.get("/games/:userId", async (request, reply) => {
		reply.send(await findGamesByUserId(request.params.userId));
	})

	//création d'un jeu
	app.post(
		"/game",
		{ preHandler: [app.authenticate] },
		async (request, reply) => {
			reply.send(await createGame(request.body.userId));
		}
	);
	//rejoindre un jeu
	app.patch(
		"/game/:action/:gameId",
		{ preHandler: [app.authenticate] },
		async (request, reply) => {
			reply.send(await updateGame(request));
		}
	);
}
