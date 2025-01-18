import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import User from "./users.js";

const Game = sequelize.define("game", {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
	},
	player1Id: {
		type: DataTypes.UUID,  // 🔥 Si users.id est UUID, ici aussi
		allowNull: false,
		references: {
			model: User,
			key: "id",
		},
	},
	player2Id: {
		type: DataTypes.UUID,
		allowNull: true,
		references: {
			model: User,
			key: "id",
		},
	},
	winnerId: {
		type: DataTypes.UUID,
		allowNull: true,
		references: {
			model: User,
			key: "id",
		},
	},
});


// Relations correctes avec alias
Game.belongsTo(User, { foreignKey: "player1Id", as: "player1" });
Game.belongsTo(User, { foreignKey: "player2Id", as: "player2" });
Game.belongsTo(User, { foreignKey: "winnerId", as: "winner" });

export default Game;
