import chalk from "chalk";
//pour fastify
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
//routes
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
//bdd
import { sequelize } from "./bdd.js";

import socketioServer from "fastify-socket.io"

//Test de la connexion
try {
	sequelize.authenticate();
	console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
	console.error("Impossible de se connecter, erreur suivante :", error);
}


/**
 * API
 * avec fastify
 */
let blacklistedTokens = [];
const app = fastify();
//Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
	.register(fastifyBcrypt, {
		saltWorkFactor: 12,
	})
	.register(cors, {
		origin: "*",
	})
	.register(fastifySwagger, {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "Documentation de l'API JDR LOTR",
				description:
					"API développée pour un exercice avec React avec Fastify et Sequelize",
				version: "0.1.0",
			},
		},
	})
	.register(fastifySwaggerUi, {
		routePrefix: "/documentation",
		theme: {
			title: "Docs - JDR LOTR API",
		},
		uiConfig: {
			docExpansion: "list",
			deepLinking: false,
		},
		uiHooks: {
			onRequest: function (request, reply, next) {
				next();
			},
			preHandler: function (request, reply, next) {
				next();
			},
		},
		staticCSP: true,
		transformStaticCSP: (header) => header,
		transformSpecification: (swaggerObject, request, reply) => {
			return swaggerObject;
		},
		transformSpecificationClone: true,
	})
	.register(fastifyJWT, {
		secret: "unanneaupourlesgouvernertous",
	})
	.register(socketioServer, {
		cors: {
			origin: "*",
			credentials: true
		}
	})
;
/**********
 * Routes
 **********/
app.get("/", (request, reply) => {
	reply.send({ documentationURL: "http://localhost:3000/documentation" });
});
// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
	try {
		const token = request.headers["authorization"].split(" ")[1];

		// Vérifier si le token est dans la liste noire
		if (blacklistedTokens.includes(token)) {
			return reply
				.status(401)
				.send({ error: "Token invalide ou expiré" });
		}
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});
//gestion utilisateur
usersRoutes(app);
//gestion des jeux
gamesRoutes(app);

/**********
 * START
 **********/
const start = async () => {
	try {
		await sequelize
			.sync({ alter: true })
			.then(() => {
				console.log(chalk.green("Base de données synchronisée."));
			})
			.catch((error) => {
				console.error(
					"Erreur de synchronisation de la base de données :",
					error
				);
			});
		await app.listen({ port: 3000 });
		console.log(
			"Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000")
		);
		console.log(
			chalk.bgYellow(
				"Accéder à la documentation sur http://localhost:3000/documentation"
			)
		);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

let games = {}; // Pour stocker les parties en mémoire (à remplacer par une base de données si nécessaire)

app.io.on("connection", (socket) => {

	// Lorsqu'un joueur crée une partie
	socket.on("create_game", (playerData) => {
		// Créer une room unique pour cette partie (par exemple avec l'ID du socket ou un identifiant unique généré)
		const gameId = `game_${socket.id}`;
		socket.join(gameId);

		// Sauvegarder la partie dans la "BDD" (en mémoire ici)
		games[gameId] = {
			player1: playerData.idUser,  // Le joueur qui crée la partie
			player2: null,        // Aucun second joueur pour l'instant
		};

		// Notifier le créateur que la partie est en attente d'un second joueur et envoi l'id de la partie
		socket.emit("game_created", { idGame : gameId, message: "Partie créée, en attente d'un second joueur..." });
	});

	// Lorsqu'un second joueur rejoint une partie existante
	socket.on("join_game", (data) => {
		const { gameId, playerData } = data;

		if (games[gameId]) {
			const game = games[gameId];

			// Vérifier que la partie est en attente d'un second joueur
			if (game.player2 === null) {
				socket.join(gameId); // Le second joueur rejoint la room

				// Mettre à jour la partie avec le second joueur
				game.player2 = playerData;
				game.state = 'ready_to_start';

				console.log(`Joueur ${playerData.name} a rejoint la partie : ${gameId}`);

				// Notifier les deux joueurs que la partie est prête à commencer
				app.io.to(gameId).emit("game_ready", { gameId, message: "Les deux joueurs sont connectés. La partie peut commencer !" });
			} else {
				socket.emit("game_full", { message: "La partie est déjà pleine." });
			}
		} else {
			socket.emit("game_not_found", { message: "La partie n'existe pas." });
		}
	});

	// TODO LANCER LA PARTY FAUT QU'il mettre prêt tout les deux

	// TODO Envoi des questions

	// TODO Réception des réponses

	// TODO Fin de la partie

	// Gérer la déconnexion
	socket.on("disconnect", () => {
		console.log(`Joueur déconnecté : ${socket.id}`);
		// Optionnel : Gérer la logique pour retirer un joueur déconnecté d'une partie en cours
	});
});


start()
