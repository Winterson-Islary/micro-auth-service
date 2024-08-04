import createHttpError from "http-errors";
import type { Repository } from "typeorm";
import type { Tenant } from "../entity/Tenant";
import type { ITenantService, TenantData } from "../types";

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
	async get(id: number) {
		try {
			return await this.tenantRepository.findOne({
				where: {
					id,
				},
			});
		} catch (_err) {
			const customError = createHttpError(
				401,
				`failed to get tenant with id: ${id}`,
			);
			throw customError;
		}
	}
}
