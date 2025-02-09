import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connexion à la base de données
 */
export const sequelize = new Sequelize({
	dialect: "mysql",
	database: process.env.DB_NAME || "database_name",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT) || 3306,
});

console.log("🔍 DB_HOST:", process.env.DB_HOST);
console.log("🔍 DB_PORT:", process.env.DB_PORT);
console.log("🔍 DB_USER:", process.env.DB_USER);
console.log("🔍 DB_PASSWORD:", process.env.DB_PASSWORD ? "OK" : "MISSING");
console.log("🔍 DB_NAME:", process.env.DB_NAME);