import type { NextFunction, Response } from "express";
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
			const _result = await this.userService.login({ email, password });
			const temporary_accessToken =
				"ninetyninetimesidontlikeit.helloworldthisisafunnybusiness.dontlikeithere";
			const temporary_refreshToken =
				"ninetyninetimesidontlikeit.helloworldthisisafunnybusiness.dontlikeithere";
			res.cookie("ACCESS_TOKEN", temporary_accessToken, {
				httpOnly: true,
				sameSite: "strict",
				secure: true,
			});
			res.cookie("REFRESH_TOKEN", temporary_refreshToken, {
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
