import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { RequestAuth } from "../types";

export function canAccess(authorizedRoles: string[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		const authRequest = req as RequestAuth;
		const authToken = authRequest.auth.role;

		if (!authorizedRoles.includes(authToken)) {
			const customError = createHttpError(403, "you are not authorized");
			next(customError);
			return;
		}
		next();
	};
}
