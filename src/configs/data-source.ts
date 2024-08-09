import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./envConfig";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: Config.DB_HOST,
	port: Number(Config.DB_PORT),
	username: Config.DB_USERNAME,
	password: Config.DB_PASSWORD,
	database: Config.DB_NAME,
	synchronize: false, // Should only be true in development.
	logging: false,
	entities: ["src/entity/*.{ts, js}"],
	migrations: ["src/migration/*.{ts, js}"],
	subscribers: [],
});
