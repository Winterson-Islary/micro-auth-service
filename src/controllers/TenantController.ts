import type { NextFunction, Request, Response } from "express";
import type { Logger } from "winston";
import type { GetTenantRequest, ITenantService, TenantRequest } from "../types";

export class TenantController {
	tenantService: ITenantService;
	logger: Logger;
	constructor(tenantService: ITenantService, logger: Logger) {
		this.tenantService = tenantService;
		this.logger = logger;
	}
	async create(req: TenantRequest, res: Response, next: NextFunction) {
		try {
			const { name, address } = req.body;
			await this.tenantService.create({ name, address });
			this.logger.info("tenant record created successfully");
			return res
				.status(201)
				.json({ message: "successfully created tenant record" });
		} catch (err) {
			next(err);
			return;
		}
	}

	async get(req: GetTenantRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.body;
			const tenant = await this.tenantService.get(Number(id));
			this.logger.info(`successfully retrieved tenant: ${tenant}`);
			return res.status(201).json({ data: tenant });
		} catch (err) {
			next(err);
		}
	}
}
