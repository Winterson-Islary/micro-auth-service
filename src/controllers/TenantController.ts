import type { NextFunction, Request, Response } from "express";
import type { ITenantService, TenantRequest } from "../types";

export class TenantController {
	tenantService: ITenantService;
	constructor(tenantService: ITenantService) {
		this.tenantService = tenantService;
	}
	async create(req: TenantRequest, res: Response, next: NextFunction) {
		try {
			const { name, address } = req.body;
			await this.tenantService.create({ name, address });
			return res
				.status(201)
				.json({ message: "successfully created tenant record" });
		} catch (err) {
			next(err);
			return;
		}
	}
}
