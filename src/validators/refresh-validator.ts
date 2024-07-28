import type { Request } from "express";
import { expressjwt } from "express-jwt";
import { AppDataSource } from "../configs/data-source";
import { Config } from "../configs/envConfig";
import logger from "../configs/logger";
import { RefreshToken } from "../entity/RefreshToken";

type IJwtPayload = {
	id: string;
};

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

	async isRevoked(_req: Request, token) {
		if (!token) {
			return true;
		}
		try {
			const tokenRepository = AppDataSource.getRepository(RefreshToken);
			const storedRefreshToken = await tokenRepository.findOne({
				where: {
					id: Number((token.payload as IJwtPayload).id),
					user: { id: Number(token.payload.sub) },
				},
			});
			return storedRefreshToken === null;
		} catch (error) {
			logger.error("Error inside refresh-validator", error);
			return true;
		}
	},
});
