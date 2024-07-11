import app from "./app";
import { Config } from "./config/envConfig";
import logger from "./config/logger";

const startServer = () => {
	const PORT = Config.PORT;
	try {
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
