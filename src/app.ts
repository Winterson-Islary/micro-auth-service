import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type NextFunction,
	type Response,
	type Request,
} from "express";
import type { HttpError } from "http-errors";
import { Config } from "./configs/envConfig";
import logger from "./configs/logger";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: Config.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.get("/", async (_req, res) => {
	res.status(200).send("Hello from auth service");
});
app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

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
