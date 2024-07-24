import app from "./app";
import { AppDataSource } from "./configs/data-source";
import { Config } from "./configs/envConfig";
import logger from "./configs/logger";

const startServer = async () => {
	const PORT = Config.PORT;
	try {
		await AppDataSource.initialize();
		logger.info("Successfully connected to database");
		app.listen(PORT, () => {
			logger.info(`Listening on PORT: ${PORT}`);
		});
	} catch (error) {
		if (!(error instanceof Error)) return;
		logger.error(error.message);
		process.exit(1);
	}
};
startServer();
