import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import type { Logger } from "winston";
import type { User } from "../entity/User";
import type {
	IUserService,
	LoginUserRequest,
	RegisterUserRequest,
} from "../types";

export class AuthController {
	userService: IUserService;
	logger: Logger;
	constructor(userService: IUserService, logger: Logger) {
		this.userService = userService;
		this.logger = logger;
	}
	async register(
		req: RegisterUserRequest,
		res: Response,
		next: NextFunction,
	) {
		const { name, email, password } = req.body;
		try {
			const result = await this.userService.create({
				name,
				email,
				password,
			});
			this.logger.info("user registered successfully: ", {
				id: result?.id,
			});
			res.status(201).json({ id: result?.id || "no id" });
		} catch (err) {
			next(err);
			return;
		}
	}
	async login(req: LoginUserRequest, res: Response, next: NextFunction) {
		const { email, password } = req.body;
		try {
			const user = await this.userService.login({ email, password });
			const payload = {
				sub: String(user?.id),
				role: user?.role,
			};
			let privateKey: Buffer;
			try {
				privateKey = fs.readFileSync(
					path.join(__dirname, "../../certs/private.pem"),
				);
			} catch (_err) {
				const customError = createHttpError(
					500,
					"error reading private key",
				);
				next(customError);
				return;
			}

			const accessToken = jwt.sign(payload, privateKey, {
				algorithm: "RS256",
				expiresIn: "1h",
				issuer: "auth-service",
			});
			const refreshToken = jwt.sign(payload, privateKey, {
				algorithm: "RS256",
				expiresIn: "30d",
				issuer: "auth-service",
			});
			res.cookie("ACCESS_TOKEN", accessToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
			});
			res.cookie("REFRESH_TOKEN", refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
			});
			this.logger.info("user logged in successfully");
			return res
				.status(200)
				.json({ message: "user logged in successfully" });
		} catch (err) {
			next(err);
			return;
		}
	}
}
