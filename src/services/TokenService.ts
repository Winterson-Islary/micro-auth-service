import createHttpError from "http-errors";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { Repository } from "typeorm";
import { Config } from "../configs/envConfig";
import type { RefreshToken } from "../entity/RefreshToken";
import type { User } from "../entity/User";
import type { ITokenService } from "../types";

export class TokenService implements ITokenService {
	constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
	generateAccessToken(payload: JwtPayload): string {
		// let privateKey: Buffer;
		// try {
		// 	privateKey = fs.readFileSync(
		// 		path.join(__dirname, "../../certs/private.pem"),
		// 	);
		// }
		let privateKey: string | undefined;
		try {
			privateKey = Config.PRIVATE_KEY;
			if (!privateKey) {
				const customError = createHttpError(500, "secret key not set");
				throw customError;
			}
		} catch (_err) {
			const customError = createHttpError(
				500,
				"error reading private key",
			);
			throw customError;
		}

		const accessToken = jwt.sign(payload, privateKey, {
			algorithm: "RS256",
			expiresIn: "1h",
			issuer: "auth-service",
		});

		return accessToken;
	}
	generateRefreshToken(payload: JwtPayload): string {
		const refreshToken = jwt.sign(payload, String(Config.JWT_REFRESH_KEY), {
			algorithm: "HS256",
			expiresIn: "30d",
			issuer: "auth-service",
			jwtid: String(payload.id),
		});
		return refreshToken;
	}

	async persistRefreshToken(user: User): Promise<RefreshToken> {
		const ThirtyDays = 1000 * 60 * 60 * 24 * 30;
		const newRefreshToken = await this.refreshTokenRepository.save({
			user: user,
			expiresAt: new Date(Date.now() + ThirtyDays),
		});

		return newRefreshToken;
	}

	async deleteRefreshToken(id: number): Promise<void> {
		await this.refreshTokenRepository.delete({ id: id });
	}
}
