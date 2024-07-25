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
	async login({
		email,
		password,
	}: { email: string; password: string }): Promise<User | null> {
		const userDetails = await this.userRepository
			.createQueryBuilder("user")
			.where("user.email = :email", { email: email })
			.getOne();
		if (!userDetails) {
			const customError = createHttpError(
				500,
				`user with ${email} does not exist`,
			);
			throw customError;
		}
		const validPassword = await bcrypt.compare(
			password,
			userDetails?.password,
		);
		if (!validPassword) {
			const customError = createHttpError(401, "invalid credentials");
			throw customError;
		}
		return userDetails;
	}

	async findById(id: number) {
		const user = await this.userRepository.findOne({
			where: {
				id,
			},
		});
		if (!user) {
			const customError = createHttpError(500, "unable to find user");
			throw customError;
		}
		return user;
	}
}
