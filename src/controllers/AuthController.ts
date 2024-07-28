import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { JwtPayload } from "jsonwebtoken";
import type { Logger } from "winston";
import { AppDataSource } from "../configs/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import type {
	ITokenService,
	IUserService,
	LoginUserRequest,
	RefreshAuth,
	RegisterUserRequest,
	RequestAuth,
} from "../types";

export class AuthController {
	userService: IUserService;
	logger: Logger;
	tokenService: ITokenService;
	constructor(
		userService: IUserService,
		logger: Logger,
		tokenService: ITokenService,
	) {
		this.userService = userService;
		this.tokenService = tokenService;
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
			if (!user) {
				const customError = createHttpError(401, "user does not exist");
				next(customError);
				return;
			}
			const payload: JwtPayload = {
				sub: String(user?.id),
				role: user?.role,
			};
			const accessToken = this.tokenService.generateAccessToken(payload);

			const newRefreshToken =
				await this.tokenService.persistRefreshToken(user);
			const refreshToken = this.tokenService.generateRefreshToken({
				...payload,
				id: newRefreshToken.id,
			});

			res.cookie("ACCESS_TOKEN", accessToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
				maxAge: 1000 * 60 * 60, // 1hr
			});
			res.cookie("REFRESH_TOKEN", refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
				maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
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

	async whoami(req: RequestAuth, res: Response, next: NextFunction) {
		const id = Number(req.auth.sub);
		try {
			const user = await this.userService.findById(id);
			return res
				.status(200)
				.json({ id: user?.id, role: user?.role, name: user?.name });
		} catch (error) {
			next(error);
			return;
		}
	}

	async refresh(req: RefreshAuth, res: Response, next: NextFunction) {
		try {
			if (req.auth.isRevoked) {
				const customError = createHttpError(
					401,
					"refresh token is revoked",
				);
				throw customError;
			}
			const id = Number(req.auth.sub);
			const user = await this.userService.findById(id);
			if (!user) {
				const customError = createHttpError(
					401,
					`could not find user with id: ${id}`,
				);
				throw customError;
			}
			const payload: JwtPayload = {
				sub: req.auth.sub,
				role: req.auth.role,
			};
			const accessToken = this.tokenService.generateAccessToken(payload);
			const newRefreshToken =
				await this.tokenService.persistRefreshToken(user);
			const refreshToken = this.tokenService.generateRefreshToken({
				...payload,
				id: newRefreshToken.id,
			});
			res.cookie("ACCESS_TOKEN", accessToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
				maxAge: 1000 * 60 * 60, // 1hr
			});
			res.cookie("REFRESH_TOKEN", refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
				maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
			});
			this.logger.info("token refresh successful");
			return res
				.status(200)
				.json({ message: "access token regenerated successfully" });
		} catch (err) {
			next(err);
			return;
		}
	}
}
