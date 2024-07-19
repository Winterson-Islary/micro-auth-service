import type { Repository } from "typeorm";
import type { User } from "../entity/User";
import type { IUserService, UserData } from "../types";

export class UserService implements IUserService {
	constructor(private userRepository: Repository<User>) {}
	async create({ name, email, password }: UserData) {
		await this.userRepository.save({ name, email, password });
	}
}
