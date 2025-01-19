import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import Game from "./game.js";
import Question from "./question.js";

const Manche = sequelize.define("manche", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Game,
            key: "id",
        },
    },
    questionId: {
        type: DataTypes.UUID,
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

Manche.belongsTo(Game, { foreignKey: "gameId" });
Manche.belongsTo(Question, { foreignKey: "questionId" });

export default Manche;
