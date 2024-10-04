import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import logger from "../configs/logger";

const tenantPaginationSchema = z.object({
	curPage: z.number(),
	perPage: z.number(),
	search: z.string().optional(),
});
type TTenantPageQuery = z.infer<typeof tenantPaginationSchema>;

export const validateTenantPageQuery = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parsedCurPage = Number(req.query.curPage);
		const parsedPerPage = Number(req.query.perPage);
		const parsedSearch: string | undefined =
			(req.query.search as string) || undefined;
		const parsedObj: TTenantPageQuery = {
			curPage: Number.isNaN(parsedCurPage) ? 1 : parsedCurPage,
			perPage: Number.isNaN(parsedPerPage) ? 5 : parsedPerPage,
			search: parsedSearch,
		};
		const validatedTenantQuery =
			await tenantPaginationSchema.parseAsync(parsedObj);

		req.body.curPage = validatedTenantQuery.curPage;
		req.body.perPage = validatedTenantQuery.perPage;
		req.body.search = validatedTenantQuery.search;
		return next();
	} catch (error) {
		logger.info({
			message: `Error: ${error}; on file: tenant-pagination-validator.ts`,
		});
		if (error instanceof z.ZodError) {
			return res.status(500).json({ errors: error.issues });
		}
		return res
			.status(400)
			.json({ error: "missing or invalid input field values" });
	}
};
