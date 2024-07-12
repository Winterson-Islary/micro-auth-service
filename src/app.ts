import express, {
	type NextFunction,
	type Response,
	type Request,
} from "express";
import type { HttpError } from "http-errors";
import logger from "./config/logger";

const app = express();
app.get("/", async (_req, res) => {
	res.status(200).send("Hello from auth service");
});
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
	logger.error(err.message);
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		errors: [
			{
				type: err.name,
				msg: err.message,
				path: "",
				location: "",
			},
		],
	});
});
export default app;
