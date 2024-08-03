import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { TenantController } from "../controllers/TenantController";
import { Tenant } from "../entity/Tenant";
import authenticate from "../middlewares/authenticate";
import { TenantService } from "../services/TenantService";
import type { TenantRequest } from "../types";

const router = Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
router.post("/", authenticate, (req, res) => {
	res.status(201).json({});
});
router.post("/create", authenticate, (req, res, next) => {
	tenantController.create(req as TenantRequest, res, next);
});

export default router;
