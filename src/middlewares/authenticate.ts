import type { Request } from "express";
import { type GetVerificationKey, expressjwt } from "express-jwt";
import jwksClient from "jwks-rsa";
import { Config } from "../configs/envConfig";

export default expressjwt({
	secret: jwksClient.expressJwtSecret({
		jwksUri: String(Config.JWKS_URI),
		cache: true,
		rateLimit: true,
	}) as GetVerificationKey,
	algorithms: ["RS256"],
	getToken(req: Request) {
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.split(" ")[1] !== "undefined") {
			const token = authHeader.split(" ")[1];
			return token;
		}

		const { ACCESS_TOKEN } = req.cookies;
		return ACCESS_TOKEN;
	},
});
