import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import { TenantController } from "../controllers/TenantController";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";
import type { TenantRequest } from "../types";

const router = Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);
router.post("/", (req, res) => {
	res.status(201).json({});
});
router.post("/create", (req, res, next) => {
	tenantController.create(req as TenantRequest, res, next);
});

export default router;
