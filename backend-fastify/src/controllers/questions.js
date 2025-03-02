import Question from "../models/questions.js";
import Sequelize from "@sequelize/core";

export async function getQuestionForParty() {
    // Récupérer 7 questions aléatoires
    const questions = await Question.findAll({
        order: Sequelize.literal('RAND()'), // SQLite & MySQL: 'RANDOM()' pour PostgreSQL
        limit: 7
    });

    return questions.map(q => q.dataValues); // Retourner un tableau propre
}
