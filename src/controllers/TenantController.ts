import type { NextFunction, Request, Response } from "express";
import type { Logger } from "winston";
import type {
	GetTenantRequest,
	ITenantService,
	TenantPaginationRequest,
	TenantRequest,
} from "../types";

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

	async getById(req: GetTenantRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.body;
			const tenant = await this.tenantService.getById(Number(id));
			this.logger.info(`successfully retrieved tenant: ${tenant}`);
			return res.status(200).json({ data: tenant });
		} catch (err) {
			next(err);
		}
	}

	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const tenantPageReq: TenantPaginationRequest = {
				search: req.body.search || undefined,
				perPage: req.body.perPage || 5,
				curPage: req.body.curPage || 1,
			};
			const tenants = await this.tenantService.getAll(tenantPageReq);
			this.logger.info("successfully retrieved tenants list");
			return res.status(200).json({ data: tenants });
		} catch (err) {
			next(err);
		}
	}
}
