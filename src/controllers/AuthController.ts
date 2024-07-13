import type { Request, Response } from "express";

export class AuthController {
	register(_req: Request, res: Response): void {
		res.status(201).send("registration successful");
	}
}
