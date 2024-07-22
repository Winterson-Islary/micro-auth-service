import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import type { User } from "../entity/User";
import { Constants, type IUserService, Roles, type UserData } from "../types";

export class UserService implements IUserService {
	constructor(private userRepository: Repository<User>) {}
	async create({ name, email, password }: UserData): Promise<User | null> {
		const userExist = await this.userRepository.findOne({
			where: { email: email },
		});
		if (userExist) {
			const err = createHttpError(400, "email already in use");
			throw err;
		}
		const hashedPassword = await bcrypt.hash(
			password,
			Constants.saltRounds,
		);
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
