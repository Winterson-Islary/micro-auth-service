import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const usersPaginationSchema = z.object({
	curPage: z.number(),
	perPage: z.number(),
});

export const ValidateUsersPaginationQuery = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parsedCurPage = Number(req.query.curPage);
		const parsedPerPage = Number(req.query.perPage);
		const usersQuery: { curPage: number; perPage: number } = {
			curPage: Number.isNaN(parsedCurPage) ? 1 : parsedCurPage,
			perPage: Number.isNaN(parsedPerPage) ? 10 : parsedPerPage,
		};
		const validatedUsersQuery =
			await usersPaginationSchema.parseAsync(usersQuery);
		req.body.curPage = validatedUsersQuery.curPage;
		req.body.perPage = validatedUsersQuery.perPage;
		return next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(500).json({ errors: error.issues });
		}
		return res
			.status(400)
			.json({ error: "missing or invalid input fields" });
	}
};
