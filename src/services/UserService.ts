import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { Brackets, type Repository } from "typeorm";
import logger from "../configs/logger";
import { User } from "../entity/User";
import {
	Constants,
	type IUserService,
	type PaginationRequest,
	Roles,
	type TUpdateUser,
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
		const Tenant =
			tenantId !== undefined && !Number.isNaN(tenantId)
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
			const queryBuilder = this.userRepository
				.createQueryBuilder("user")
				.leftJoin("user.tenant", "tenant");
			if (paginationOption.username) {
				const searchTerm = `%${paginationOption.username}%`;
				queryBuilder.where(
					new Brackets((qb) => {
						qb.where("user.name ILIKE :term", {
							term: searchTerm,
						}).orWhere("user.email ILike :term", {
							term: searchTerm,
						});
					}),
				);
				queryBuilder.where(
					new Brackets((qb) => {
						qb.where("user.name ILIKE :term", {
							term: searchTerm,
						}).orWhere("user.email ILike :term", {
							term: searchTerm,
						});
					}),
				);
			}
			if (paginationOption.role) {
				queryBuilder.andWhere("user.role = :role", {
					role: paginationOption.role,
				});
			}
			if (paginationOption.isActive) {
				queryBuilder.andWhere("user.isActive = :isActive", {
					isActive: paginationOption.isActive,
				});
			}
			const users: [User[], number] = await queryBuilder
				.select([
					"user.id",
					"user.name",
					"user.role",
					"user.email",
					"user.tenant",
					"user.createdAt",
					"user.isActive",
					"tenant.id",
					"tenant.name",
					"tenant.address",
				])
				.skip((paginationOption.curPage - 1) * paginationOption.perPage)
				.take(paginationOption.perPage)
				.orderBy("user.id", "DESC")
				.getManyAndCount();
			return users;
		} catch (_err) {
			const customError = createHttpError(400, "failed to get users");
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

	async update(userData: TUpdateUser) {
		try {
			const user = await this.userRepository.findOne({
				where: {
					id: userData.id,
				},
				relations: {
					tenant: true,
				},
			});
			if (!user) {
				const customError = createHttpError(500, "unable to find user");
				throw customError;
			}
			const hashedPassword = userData.password
				? await bcrypt.hash(userData.password, Constants.saltRounds)
				: undefined;
			await this.userRepository.update(
				{ id: userData.id },
				{
					name: userData.name || user.name,
					email: userData.email || user.email,
					password: hashedPassword || user.password,
					isActive: userData.isActive || user.isActive,
					role: userData.role || user.role,
				},
			);
			logger.info("Logging User Data: ", userData);
		} catch (err) {
			logger.info(`Error: ${err}; Location: "UserService";`);
			const customError = createHttpError(400, "failed to update user");
			throw customError;
		}
	}
}
