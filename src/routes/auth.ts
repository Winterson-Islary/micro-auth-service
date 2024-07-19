import { Router } from "express";
import { AppDataSource } from "../configs/data-source";
import { AuthController } from "../controllers/AuthController";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);
router.post("/register", (req, res) => authController.register(req, res)); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.

export default router;
