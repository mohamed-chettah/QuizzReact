import Manche from "../models/manches.js";


export async function getMancheByGameIdAndQuestionId(gameId, questionId){
    // Récupérer la manche correspondant à un jeu et une question
    return await Manche.findOne({
        where: {
            gameId: gameId,
            questionId: questionId
        }
    });
}

export async function createManche(datas) {
    // Créer une nouvelle manche
    const manche = await Manche.create(datas);

    return manche.dataValues;
}
