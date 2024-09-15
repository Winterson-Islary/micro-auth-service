import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { UserController } from "../controllers/UserController";
import { Tenant } from "../entity/Tenant";
import { User } from "../entity/User";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { TenantService } from "../services/TenantService";
import { UserService } from "../services/UserService";
import { type AdminRequest, Roles } from "../types";
import { ValidateUsersPaginationQuery } from "../validators/pagination-validator";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const userService = new UserService(userRepository, tenantService);
const userController = new UserController(userService, logger);
router.post(
	"/",
	authenticate,
	canAccess([Roles.ADMIN, Roles.SUPERADMIN]),
	(req, res, next) => {
		userController.create(req as AdminRequest, res, next);
	},
);
router.get(
	"/",
	authenticate,
	canAccess([Roles.ADMIN, Roles.SUPERADMIN]),
	ValidateUsersPaginationQuery,
	(req, res, next) => {
		userController.get(req, res, next);
	},
);
router.delete(
	"/:id",
	authenticate,
	canAccess([Roles.ADMIN, Roles.SUPERADMIN]),
	(req, res, next) => {
		userController.destroy(req, res, next);
	},
);

export default router;
