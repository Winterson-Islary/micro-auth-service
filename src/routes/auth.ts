import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";

const router = Router();
const userService = new UserService();
const authController = new AuthController(userService);
router.post("/register", (req, res) => authController.register(req, res)); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.

export default router;
