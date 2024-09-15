import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import { User } from "../entity/User";
import {
	Constants,
	type IUserService,
	type PaginationRequest,
	Roles,
	type UserData,
} from "../types";
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
			? await this.tenantService.getById(Number(tenantId))
			: null;
		try {
			return await this.userRepository.save({
				name,
				email,
				password: hashedPassword,
				role: role ?? Roles.CUSTOMER,
				tenant: Tenant ?? undefined,
			});
		} catch (err) {
			const customError = createHttpError(500, `${err}`);
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
	async getAll(paginationOption: PaginationRequest) {
		try {
			const queryBuilder = this.userRepository.createQueryBuilder("user");
			const users: [User[], number] = await queryBuilder
				.skip((paginationOption.curPage - 1) * paginationOption.perPage)
				.take(paginationOption.perPage)
				.select([
					"user.id",
					"user.name",
					"user.role",
					"user.email",
					"user.tenant",
					"user.createdAt",
					"user.isActive",
				])
				.getManyAndCount();
			return users;
		} catch (_err) {
			const customError = createHttpError(500, "failed to get users");
			throw customError;
		}
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
