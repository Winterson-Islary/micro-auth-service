import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { Tenant } from "../entity/Tenant";
import { User } from "../entity/User";
import authenticate from "../middlewares/authenticate";
import getRefreshToken from "../middlewares/getRefreshToken";
import { TenantService } from "../services/TenantService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import type { RefreshAuth, RequestAuth } from "../types";
import { ValidateUserLogin } from "../validators/login-validator";
import RefreshTokenValidator from "../validators/refresh-validator";
import { ValidateUserRegistration } from "../validators/register-validator";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const userService = new UserService(userRepository, tenantService);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);
router.post("/register", ValidateUserRegistration, (req, res, next) =>
	authController.register(req, res, next),
); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.
router.post("/login", ValidateUserLogin, (req, res, next) =>
	authController.login(req, res, next),
);
router.get("/whoami", authenticate, (req, res, next) =>
	authController.whoami(req as RequestAuth, res, next),
);
router.post("/refresh", RefreshTokenValidator, (req, res, next) => {
	authController.refresh(req as RefreshAuth, res, next);
});
router.post("/logout", authenticate, getRefreshToken, (req, res, next) => {
	authController.logout(req as RefreshAuth, res, next);
});
export default router;
