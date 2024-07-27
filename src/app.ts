import "reflect-metadata";
import cookieParser from "cookie-parser";
import express, {
	type NextFunction,
	type Response,
	type Request,
} from "express";
import type { HttpError } from "http-errors";
import logger from "./configs/logger";
import authRouter from "./routes/auth";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.get("/", async (_req, res) => {
	res.status(200).send("Hello from auth service");
});
app.use("/auth", authRouter);
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
	logger.error(err.message);
	const statusCode = err.statusCode || err.status || 500;
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
