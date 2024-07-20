import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import type { User } from "../entity/User";
import { type IUserService, Roles, type UserData } from "../types";

export class UserService implements IUserService {
	constructor(private userRepository: Repository<User>) {}
	async create({ name, email, password }: UserData): Promise<User | null> {
		try {
			return await this.userRepository.save({
				name,
				email,
				password,
				role: Roles.CUSTOMER,
			});
		} catch (_err) {
			const customError = createHttpError(500, "failed to register user");
			throw customError;
		}
	}
	async get({ email }: { email: string }): Promise<User | null> {
		return await this.userRepository
			.createQueryBuilder("user")
			.where("user.email = :email", { email: email })
			.getOne();
	}
}
