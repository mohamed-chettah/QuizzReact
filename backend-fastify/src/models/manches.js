import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import Game from "./games.js";
import Question from "./questions.js";

const Manche = sequelize.define("Manche", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Ajoute auto-increment si l'id est un integer
    },
    gameId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Game,
            key: "id",
        },
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Question,
            key: "id",
        },
    },

    player1Rep: DataTypes.STRING,
    player2Rep: DataTypes.STRING,
    player1Point: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    player2Point: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

// ✅ Ajoute des alias pour éviter le conflit Sequelize
Manche.belongsTo(Game, { foreignKey: "gameId", as: "relatedGame" });
Manche.belongsTo(Question, { foreignKey: "questionId", as: "relatedQuestion" });

export default Manche;
