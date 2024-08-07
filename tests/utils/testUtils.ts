import type { Repository } from "typeorm";
import type { Tenant } from "../../src/entity/Tenant";

export const isValidJWT = (token: string | null): boolean => {
	if (!token) {
		return false;
	}
	const parts = token.split(".");
	if (parts.length !== 3) {
		return false;
	}
	try {
		for (const part of parts) {
			Buffer.from(part, "base64").toString("utf-8");
		}
		return true;
	} catch (_err) {
		return false;
	}
};

export const createTenant = async (tenantRepository: Repository<Tenant>) => {
	return await tenantRepository.save({
		name: "Test Tenant",
		address: "Test Address",
	});
};
