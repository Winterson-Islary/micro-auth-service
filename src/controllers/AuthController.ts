import type { Response } from "express";
import type { IUserService, RegisterUserRequest } from "../types";

export class AuthController {
	userService: IUserService;
	constructor(userService: IUserService) {
		this.userService = userService;
	}
	async register(req: RegisterUserRequest, res: Response) {
		const { name, email, password } = req.body;
		this.userService.create({ name, email, password });
		res.status(201).json();
	}
}
