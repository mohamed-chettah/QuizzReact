import chalk from "chalk";
// pour fastify
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
// bdd
import { sequelize } from "./bdd.js"; // D'abord, on importe Sequelize
import socketioServer from "fastify-socket.io"
import {createGame, getGame, getGamewithPlayers, updateGame} from "./controllers/games.js";
import {getQuestionForParty} from "./controllers/questions.js";
// ✅ Importer les modèles APRES avoir importé `sequelize`
import Game from "./models/games.js";
import Manche from "./models/manches.js";
import Question from "./models/questions.js";

// Définir les relations après l'importation des modèles
Game.hasMany(Manche, { foreignKey: "gameId" });
Manche.belongsTo(Game, { foreignKey: "gameId" });

Question.hasMany(Manche, { foreignKey: "questionId" });
Manche.belongsTo(Question, { foreignKey: "questionId" });

// Vérification des modèles enregistrés
console.log("📌 Modèles enregistrés :", sequelize.models);

try {
	sequelize.authenticate();
	console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
	console.error("Impossible de se connecter, erreur suivante :", error);
}

/**
 * API avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

// Ajout du plugin fastify-bcrypt pour le hash du mdp
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
			credentials: true,
		},
	});

/**********
 * Routes
 **********/
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
import {json} from "sequelize";
import {createManche, getMancheByGameIdAndQuestionId} from "./controllers/manches.js";

// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
	try {
		const token = request.headers["authorization"].split(" ")[1];

		// Vérifier si le token est dans la liste noire
		if (blacklistedTokens.includes(token)) {
			return reply.status(401).send({ error: "Token invalide ou expiré" });
		}
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

// Gestion des routes
usersRoutes(app);
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
		const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		// Rejoint la Room
		socket.join(gameId);

		// Sauvegarder la partie dans la "BDD" (en mémoire ici)
		games[gameId] = {
			id: gameId,
			player1: playerData.idUser,  // Le joueur qui crée la partie
			player2: null,        // Aucun second joueur pour l'instant
			state: 'pending',
		};

		// créate game in db
		createGame(games[gameId]).then(r => {

		});

		// Notifier le créateur que la partie est en attente d'un second joueur et envoi l'id de la partie
		socket.emit("game_created", { idGame : gameId, message: "Partie créée, en attente d'un second joueur..." });
	});

	// Lorsqu'un second joueur rejoint une partie existante
	socket.on("join_game", async (data) => {
		const gameId = data.gameId;
		const player2 = data.idUser;
		const game = await getGame({params: {gameId: gameId}}).then(r => {
			return r;
		});
		if (game) {

			// Vérifier que la partie est en attente d'un second joueur
			if (game.player2Id === null && player2) {
				socket.join(gameId); // Le second joueur rejoint la room

				// Mettre à jour la partie avec le second joueur
				const gameData = {
					player2: player2,
					state: 'playing',
				};
				// Mettre à jour la partie en BDD
				const gameUpdated = await updateGame({params: {action: "join", gameId: gameId}, body: { player2: player2, state: 'playing'}
				}).then(r => {
					return r;
				});

				// Notifier les deux joueurs que la partie est prête à commencer
				app.io.to(gameId).emit("game_ready", {
					idGame: gameId,
					game: gameUpdated,
					message: "Les deux joueurs sont connectés. La partie peut commencer !"
				});
			} else {
				socket.emit("game_full", { message: "La partie est déjà pleine." });
			}
		} else {
			socket.emit("game_not_found", { message: "La partie n'existe pas." });
		}
	});

	// Récuperation des infos de la partie
	socket.on("get_game_state", async (gameId) => {
		if (gameId) {
			const game = await getGamewithPlayers({params: {gameId}}).then(r => {
				return r;
			});

			if (!game) {
				socket.emit("error", {message: "La partie n'existe pas."});
				return;
			}
			app.io.to(gameId).emit("game_state", game);
		}
		else {
			socket.emit("error", {message: "L'identifiant de la partie est incorrect."});
		}

	});

	socket.on("get_questions", async (gameId) => {
		// Récupérer les questions pour la partie
		const questions = await getQuestionForParty();

		// Envoyer les questions aux joueurs
		app.io.to(gameId).emit("questions_party", questions);
	});

	const calculateScore = (timeLeft, correct, isLastQuestion) => {
		const baseScore = timeLeft * 10; // 10 points par seconde restante
		if(isLastQuestion){
			return correct ? baseScore * 2 : 0; // Score double si c'est la dernière question
		}
		return correct ? baseScore : 0; // Score uniquement si la réponse est correcte
	};

	socket.on("submit_answer", async (data) => {
		const { gameId, playerId, question ,answer, timer, isPlayer1, isLastQuestion} = data;

		// Vérifier si la réponse est correcte
		const correct = answer === question.bonne_reponse;

		// Calculer le score
		const score = calculateScore(timer, correct, isLastQuestion);

		// Si la manche existe déjà, on la met à jour sinon on la créé
		let manche = await getMancheByGameIdAndQuestionId(gameId, question.id)

		if(manche){
			if(isPlayer1 && manche.player1Rep == null){
				manche.player1Point = score;
				manche.player1Rep = answer;
			}
			else if(manche.player2Rep == null){
				manche.player2Point = score;
				manche.player2Rep = answer;
			}
			manche.save();

			// On prévient l'autre joueur que tout le monde à répondu donc on passe à la question suivante
			app.io.to(gameId).emit("next_question");
		}
		else {
			if(isPlayer1){
				manche = await createManche(
					{
						gameId: gameId,
						questionId: question.id,
						player1Point: score,
						player1Rep: answer,
					}
				).then(r => {
					return r;
				})
			}
			else {
				manche = await createManche(
					{
						gameId: gameId,
						questionId: question.id,
						player2Point: score,
						player2Rep: answer,
					}
				).then(r => {
					return r
				})
			}

		}
		// Envoyer le score et résultat à tous les joueurs
		app.io.to(gameId).emit("player_score_result",{ manche : manche, playerId : playerId, score : score, correct : correct });

	});

	socket.on("end_game", async (gameId) => {
		const game = await getGamewithPlayers({params: {gameId}}).then(r => {
			return r;
		});
		if (game) {
			const manches = await Manche.findAll({where: {gameId: gameId}});
			let player1Score = 0;
			let player2Score = 0;
			manches.forEach(manche => {
					player1Score += manche.player1Point;
					player2Score += manche.player2Point;
				}
			);
			let winner = null;
			if (player1Score > player2Score) {
				winner = game.player1Id;
			} else if (player1Score < player2Score) {
				winner = game.player2Id;
			} else {
				winner = "egalite";
			}

			// Mettre à jour la partie en BDD
			await updateGame({params: {action: "finish", gameId: gameId}, body: { state: 'finished', winner : winner}
			}).then(r => {
				return r;
			});
			app.io.to(gameId).emit("game_end", {
				winner: winner,
				player1Score: player1Score,
				player2Score: player2Score
			});
		}
	})


	// Gérer la déconnexion
	socket.on("disconnect", (data) => {
		console.log("déconnexion", data);
		// TODO préveneir la room que le joueur s'est déconnecté et mettre à jour la partie (mettre fin)
		// Optionnel : Gérer la logique pour retirer un joueur déconnecté d'une partie en cours
	});
});


start()
