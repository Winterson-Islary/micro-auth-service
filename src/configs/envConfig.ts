import path from "node:path";
import { config } from "dotenv";
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
	PORT,
	NODE_ENV,
	DB_HOST,
	DB_PORT,
	DB_NAME,
	DB_PASSWORD,
	DB_USERNAME,
	JWT_REFRESH_KEY,
} = process.env;

export const Config = {
	PORT,
	NODE_ENV,
	DB_HOST,
	DB_PORT,
	DB_NAME,
	DB_PASSWORD,
	DB_USERNAME,
	JWT_REFRESH_KEY,
} as const;
