import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import type { User } from "../entity/User";
import type { UserService } from "../services/UserService";
import type { AdminRequest } from "../types";
export class UserController {
	userService: UserService;
	logger: Logger;
	constructor(userService: UserService, logger: Logger) {
		this.userService = userService;
		this.logger = logger;
	}
	async create(req: AdminRequest, res: Response, next: NextFunction) {
		const { name, password, email, role, tenantId } = req.body;
		this.logger.info(`Tenant ID from user: ${tenantId}`);
		try {
			const result = await this.userService.create({
				name,
				password,
				email,
				role,
				tenantId: Number(tenantId),
			});
			this.logger.info(
				`User Creation By Admin: ${result?.tenant.id}-${result?.tenant.name}-${result?.tenant.address}`,
			);
			this.logger.info("manager created successfully");
			return res
				.status(201)
				.json({ message: "manager record created successfully" });
		} catch (_err) {
			const customError = createHttpError(401, `${_err}`);
			next(customError);
		}
	}
	async get(_req: Request, res: Response, next: NextFunction) {
		try {
			const user: User[] = await this.userService.getAll();
			return res.status(200).json({ users: user });
		} catch (err) {
			next(err);
			return;
		}
	}
	async destroy(req: Request, res: Response, next: NextFunction) {
		const userID = Number(req.params.id);
		if (Number.isNaN(userID)) {
			const customError = createHttpError(400, "Invalid Params");
			next(customError);
			return;
		}
		try {
			await this.userService.deleteById(userID);
			this.logger.info(`deleted user with id: ${userID}`);
			return res
				.status(201)
				.json({ message: `deleted user with id: ${userID}` });
		} catch (err) {
			next(err);
			return;
		}
	}
}
