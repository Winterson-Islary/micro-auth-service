import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
	res.status(201).json({});
});

export default router;
