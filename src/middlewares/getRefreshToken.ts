import type { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../configs/envConfig";
import logger from "../configs/logger";

const RefreshSecret = Config.JWT_REFRESH_KEY;
if (!RefreshSecret) {
	throw logger.error("failed to find refresh secret key");
}
export default expressjwt({
	secret: RefreshSecret,
	algorithms: ["HS256"],
	getToken(req: Request) {
		const { REFRESH_TOKEN } = req.cookies;
		return REFRESH_TOKEN;
	},
});
