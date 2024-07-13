import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();
router.post("/register", (req, res) => authController.register(req, res)); // Controller.register is inside a callback because of the ambiguous binding of "this" keyword.

export default router;
