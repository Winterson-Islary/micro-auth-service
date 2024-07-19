import { AppDataSource } from "../configs/data-source";
import { User } from "../entity/User";
import type { IUserService, UserData } from "../types";

export class UserService implements IUserService {
	async create({ name, email, password }: UserData) {
		const userRepository = AppDataSource.getRepository(User);
		await userRepository.save({ name, email, password });
	}
}
