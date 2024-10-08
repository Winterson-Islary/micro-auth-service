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
		this.logger.info(
			`Tenant ID from user: ${tenantId} of type ${typeof tenantId}`,
		);
		try {
			await this.userService.create({
				name,
				password,
				email,
				role,
				tenantId: Number(tenantId),
			});
			this.logger.info("manager created successfully");
			return res
				.status(201)
				.json({ message: "manager record created successfully" });
		} catch (_err) {
			const customError = createHttpError(401, `${_err}`);
			next(customError);
		}
	}
	async get(req: Request, res: Response, next: NextFunction) {
		const paginationOption = {
			curPage: req.body.curPage,
			perPage: req.body.perPage,
			username: req.body.searchUser,
			role: req.body.searchRole,
			isActive: req.body.searchIsActive,
		};
		try {
			const users: [User[], number] =
				await this.userService.getAll(paginationOption);
			return res.status(200).json({
				curPage: paginationOption.curPage,
				perPage: paginationOption.perPage,
				users: users[0],
				count: users[1],
			});
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
				.status(204)
				.json({ message: `deleted user with id: ${userID}` });
		} catch (err) {
			next(err);
			return;
		}
	}
	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const newUserData = {
				id: req.body.id,
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				role: req.body.role,
				isActive: req.body.isActive,
			};
			if (!newUserData.id) {
				throw new Error("missing id for update request;");
			}
			await this.userService.update(newUserData);

			return res
				.status(204)
				.json({ message: "user updated successfully" });
		} catch (error) {
			next(error);
			return;
		}
	}
}
