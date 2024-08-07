import type { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import type { UserService } from "../services/UserService";
import type { AdminRequest } from "../types";
import { Roles } from "../types";
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
			const customError = createHttpError(401, "failed to create user");
			next(customError);
		}
	}
}