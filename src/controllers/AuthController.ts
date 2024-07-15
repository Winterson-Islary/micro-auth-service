import type { Request, Response } from "express";
import { AppDataSource } from "../configs/data-source";
import { User } from "../entity/User";

type UserData = {
	name: string;
	email: string;
	password: string;
};
interface RegisterUserRequest extends Request {
	body: UserData;
}
export class AuthController {
	async register(req: RegisterUserRequest, res: Response) {
		const { name, email, password } = req.body;
		const userRepository = AppDataSource.getRepository(User);
		await userRepository.save({ name, email, password });
		res.status(201).json();
	}
}
