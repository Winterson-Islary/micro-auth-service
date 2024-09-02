import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { TenantController } from "../controllers/TenantController";
import { Tenant } from "../entity/Tenant";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { TenantService } from "../services/TenantService";
import { type GetTenantRequest, Roles, type TenantRequest } from "../types";

const router = Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);
router.post("/", authenticate, (_req, res) => {
	res.status(201).json({});
});
router.post(
	"/create",
	authenticate,
	canAccess([Roles.ADMIN, Roles.SUPERADMIN]),
	(req, res, next) => {
		tenantController.create(req as TenantRequest, res, next);
	},
);
router.get("/getById", authenticate, (req, res, next) => {
	tenantController.getById(req as GetTenantRequest, res, next);
});

router.get("/getAll", authenticate, (req, res, next) => {
	tenantController.getAll(req, res, next);
});

export default router;
