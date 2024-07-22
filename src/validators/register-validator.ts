import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const userRegisterSchema = z.object({
	body: z.object({
		name: z
			.string({ required_error: "name cannot be empty" })
			.trim()
			.max(20),

		email: z
			.string({ required_error: "email cannot be empty" })
			.trim()
			.email("not a valid email"),
		password: z
			.string({ required_error: "password cannot be empty" })
			.trim()
			.min(8),
	}),
});

export const ValidateUserRegistration = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validRequestBody = await userRegisterSchema.parseAsync({
			body: req.body,
		});
		req.body = validRequestBody.body;
		return next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ errors: error.issues });
		}
		return res
			.status(400)
			.json({ error: "missing or invalid input fields" });
	}
};
