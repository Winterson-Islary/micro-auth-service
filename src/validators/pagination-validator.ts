import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const usersPaginationSchema = z.object({
	curPage: z.number(),
	perPage: z.number(),
	isActive: z.boolean().optional(),
	role: z.enum(["customer", "admin", "super", "manager"]).optional(),
	user: z.string().trim().optional(),
});

export const ValidateUsersPaginationQuery = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parsedCurPage = Number(req.query.curPage);
		const parsedPerPage = Number(req.query.perPage);
		const parsedUser: string | null = (req.query.user as string) || null;
		const parsedRole: string | null = (req.query.role as string) || null;
		const parsedIsActive: boolean | null =
			Boolean(req.query.isActive as string) || null;
		const usersQuery: {
			curPage: number;
			perPage: number;
			role: string | undefined;
			isActive: boolean | undefined;
			user: string | undefined;
		} = {
			curPage: Number.isNaN(parsedCurPage) ? 1 : parsedCurPage,
			perPage: Number.isNaN(parsedPerPage) ? 10 : parsedPerPage,
			role: parsedRole ?? undefined,
			isActive: parsedIsActive ?? undefined,
			user: parsedUser ?? undefined,
		};
		const validatedUsersQuery =
			await usersPaginationSchema.parseAsync(usersQuery);
		req.body.curPage = validatedUsersQuery.curPage;
		req.body.perPage = validatedUsersQuery.perPage;
		req.body.searchRole = validatedUsersQuery.role;
		req.body.searchUser = validatedUsersQuery.user;
		req.body.searchIsActive = validatedUsersQuery.isActive;
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
