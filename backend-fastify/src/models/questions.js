import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";

const Question = sequelize.define("question", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    labelQuestion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rep1: DataTypes.STRING,
    rep2: DataTypes.STRING,
    rep3: DataTypes.STRING,
    rep4: DataTypes.STRING,
    bonne_reponse: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    photo: {
        type: DataTypes.TEXT,  // Stockage en base64
        allowNull: true,
    },
});

export default Question;
