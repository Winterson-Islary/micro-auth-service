import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import { User } from "../entity/User";
import { Constants, type IUserService, Roles, type UserData } from "../types";
import type { TenantService } from "./TenantService";

export class UserService implements IUserService {
	constructor(
		private userRepository: Repository<User>,
		private tenantService: TenantService,
	) {}
	async create({
		name,
		email,
		password,
		role,
		tenantId,
	}: UserData): Promise<User | null> {
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
		const Tenant = tenantId
			? await this.tenantService.get(Number(tenantId))
			: null;
		try {
			return await this.userRepository.save({
				name,
				email,
				password: hashedPassword,
				role: role ?? Roles.CUSTOMER,
				tenant: Tenant ?? undefined,
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
			relations: {
				tenant: true,
			},
		});
		if (!user) {
			const customError = createHttpError(500, "unable to find user");
			throw customError;
		}
		return user;
	}

	async deleteById(id: number) {
		try {
			return await this.userRepository
				.createQueryBuilder()
				.delete()
				.from(User)
				.where("id = :id", { id })
				.execute();
		} catch (_err) {
			const customError = createHttpError(400, "failed to delete user");
			throw customError;
		}
	}
}
