import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import type { User } from "../entity/User";
import { type IUserService, Roles, SaltRounds, type UserData } from "../types";

export class UserService implements IUserService {
	constructor(private userRepository: Repository<User>) {}
	async create({ name, email, password }: UserData): Promise<User | null> {
		const hashedPassword = await bcrypt.hash(password, SaltRounds);
		try {
			return await this.userRepository.save({
				name,
				email,
				password: hashedPassword,
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
