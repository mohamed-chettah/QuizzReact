import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import User from "./users.js";

const Game = sequelize.define("game", {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	state: {
		type: DataTypes.ENUM("pending", "playing", "finished"),
		allowNull: false,
		defaultValue: "pending",
	},
	player1Id: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: User,
			key: "id",
		},
	},

	player2Id: {
		type: DataTypes.STRING,
		allowNull: true,
		references: {
			model: User,
			key: "id",
		},
	},
	winner: {
		type: DataTypes.STRING,
		allowNull: true,
		references: {
			model: User,
			key: "id",
		},
	},
});

Game.belongsTo(User, { foreignKey: "player1Id", as: "player1" });
Game.belongsTo(User, { foreignKey: "player2Id", as: "player2" });
Game.belongsTo(User, { foreignKey: "winner", as: "winners" });

export default Game;
