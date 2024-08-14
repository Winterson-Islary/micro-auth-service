import path from "node:path";
import { config } from "dotenv";
config({
	path: path.join(
		__dirname,
		`../../.env.${process.env.NODE_ENV || "development"}`,
	),
});

const {
	PORT,
	NODE_ENV,
	DB_HOST,
	DB_PORT,
	DB_NAME,
	DB_PASSWORD,
	DB_USERNAME,
	JWT_REFRESH_KEY,
	JWKS_URI,
	PRIVATE_KEY,
	SUPER_NAME,
	SUPER_EMAIL,
	SUPER_PASS,
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
	JWKS_URI,
	PRIVATE_KEY,
	SUPER_NAME,
	SUPER_EMAIL,
	SUPER_PASS,
} as const;
