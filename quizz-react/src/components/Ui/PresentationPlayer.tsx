import { motion } from "framer-motion";

type Player = {
    id: string;
    username: string;
    score: number;
    image: string;
    bg: string;
};

function PlayerCircle(props: { player1: Player; player2: Player }) {
    const actualPlayerIsPlayer1 = localStorage.getItem("id") === props.player1.id;

    return (
        <div className={`w-full flex flex-col text-white gap-4 ${actualPlayerIsPlayer1 ? "flex-col" : "flex-col-reverse"}`}>

            {/* Bloc du joueur 1 */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="relative w-full h-[250px] bg-center bg-cover flex items-center justify-center"
                style={{ backgroundImage: `url(${props.player1.bg})` }}
            >
                {/* Overlay semi-transparent */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                    className="relative flex justify-center gap-5 py-20"
                >
                    <motion.img
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white"
                        src={props.player1.image}
                        alt={props.player1.username}
                    />

                    <div className="flex gap-1 items-start flex-col">
                        <p className="font-bold text-white text-xl">{props.player1.username}</p>
                        <p className="text-white">Shinobi</p>
                        <p className="text-white">Level 999</p>
                        <div className="flex gap-1">
                            <img className="w-6 h-6 rounded-full object-cover border-[1px] border-white"
                                 src="/france.png"
                                 alt="france flag"/>
                            <p className="text-white">France</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Séparateur avec animation */}
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex justify-center items-center"
            >
                <hr className="w-full my-5 h-1 bg-white"/>
                <motion.img
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    src="/quizup-logo.png"
                    alt={"quizup logo"}
                />
                <hr className="w-full my-5 h-1 bg-white"/>
            </motion.div>

            {/* Bloc du joueur 2 */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                className="relative w-full h-[250px] bg-center bg-cover flex items-center justify-center"
                style={{ backgroundImage: `url(${props.player2.bg})` }}
            >
                {/* Overlay semi-transparent */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                    className="relative flex justify-center gap-5 py-20"
                >
                    <motion.img
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white"
                        src={props.player2.image}
                        alt={props.player2.username}
                    />

                    <div className="flex gap-1 items-start flex-col">
                        <p className="font-bold text-white text-xl">{props.player2.username}</p>
                        <p className="text-white">Shinobi</p>
                        <p className="text-white">Level 999</p>
                        <div className="flex gap-1">
                            <img className="w-6 h-6 rounded-full object-cover border-[1px] border-white"
                                 src="/france.png"
                                 alt="france flag"/>
                            <p className="text-white">France</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

        </div>
    );
}

export default PlayerCircle;
