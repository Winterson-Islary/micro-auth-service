import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { ValidateUserLogin } from "../validators/login-validator";
import { ValidateUserRegistration } from "../validators/register-validator";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);
router.post("/register", ValidateUserRegistration, (req, res, next) =>
	authController.register(req, res, next),
); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.
router.post("/login", ValidateUserLogin, (req, res, next) =>
	authController.login(req, res, next),
);
router.get("/whoami", (req, res, next) =>
	authController.whoami(req, res, next),
);
export default router;
