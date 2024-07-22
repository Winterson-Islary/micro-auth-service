import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import logger from "../configs/logger";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { ValidateUserRegistration } from "../validators/register-validator";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);
router.post("/register", ValidateUserRegistration, (req, res, next) =>
	authController.register(req, res, next),
); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.

export default router;
