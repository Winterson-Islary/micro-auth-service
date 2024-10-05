import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const userUpdateSchema = z.object({
	id: z.number(),
	name: z.string().optional(),
	email: z.string().email().optional(),
	role: z.string().optional(),
	isActive: z.boolean().optional(),
	password: z.string().optional(),
});

export const ValidateUserUpdateQuery = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.body.id || Number.isNaN(req.body.id)) {
			const customError = new Error("invalid or missing user id");
			throw customError;
		}
		const parsedId = Number(req.body.id);
		const parsedName = req.body.name || undefined;
		const parsedEmail = req.body.email || undefined;
		const parsedRole = req.body.role || undefined;
		const parsedIsActive = Boolean(req.body.isActive) || undefined;
		const parsedPassword = req.body.password || undefined;
		const tempData = {
			id: parsedId,
			name: parsedName,
			email: parsedEmail,
			role: parsedRole,
			isActive: parsedIsActive,
			password: parsedPassword,
		};
		const validatedUserData = await userUpdateSchema.parseAsync(tempData);
		req.body.id = validatedUserData.id;
		req.body.name = validatedUserData.name;
		req.body.email = validatedUserData.email;
		req.body.role = validatedUserData.role;
		req.body.isActive = validatedUserData.isActive;
		req.body.password = validatedUserData.password;
		return next();
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(500).json({ errors: err.issues });
		}
		return res.status(400).json({ error: err });
	}
};
