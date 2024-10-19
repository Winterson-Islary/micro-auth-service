import createHttpError from "http-errors";
import { Brackets, type Repository } from "typeorm";
import type { Tenant } from "../entity/Tenant";
import type {
	ITenantService,
	TenantData,
	TenantPaginationRequest,
} from "../types";

export class TenantService implements ITenantService {
	constructor(private tenantRepository: Repository<Tenant>) {}

	async create(tenantData: TenantData) {
		try {
			await this.tenantRepository.save(tenantData);
		} catch (_err) {
			const customError = createHttpError(
				500,
				"failed to save tenant data",
			);
			throw customError;
		}
	}
	async getById(id: number) {
		try {
			return await this.tenantRepository.findOne({
				where: {
					id,
				},
			});
		} catch (_err) {
			const customError = createHttpError(
				500,
				`failed to get tenant with id: ${id}`,
			);
			throw customError;
		}
	}
	async getAll(tenantPageReq: TenantPaginationRequest) {
		try {
			const queryBuilder =
				this.tenantRepository.createQueryBuilder("tenant");
			if (tenantPageReq.search) {
				const searchTerm = `%${tenantPageReq.search}%`;
				queryBuilder.where(
					new Brackets((qb) => {
						qb.where("tenant.name ILIKE :term", {
							term: searchTerm,
						}).orWhere("tenant.address ILIKE :term", {
							term: searchTerm,
						});
					}),
				);
			}
			const tenants: Tenant[] = await queryBuilder
				.select([
					"tenant.id",
					"tenant.name",
					"tenant.address",
					"tenant.createdAt",
				])
				.skip((tenantPageReq.curPage - 1) * tenantPageReq.perPage)
				.take(tenantPageReq.perPage)
				.orderBy("tenant.id", "DESC")
				.getMany();
			// const tenants: Tenant[] = await this.tenantRepository.find({
			// 	select: {
			// 		id: true,
			// 		name: true,
			// 		address: true,
			// 		createdAt: true,
			// 	},
			// });
			return tenants;
		} catch (_err) {
			const customError = createHttpError(500, "failed to get tenants");
			throw customError;
		}
	}
}
