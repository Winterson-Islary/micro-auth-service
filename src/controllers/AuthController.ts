import type { NextFunction, Response } from "express";
import type { Logger } from "winston";
import type { User } from "../entity/User";
import type { IUserService, RegisterUserRequest } from "../types";

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
}
