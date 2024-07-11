import app from "./app";
import { Config } from "./config/envConfig";

const startServer = () => {
	const PORT = Config.PORT;
	try {
		app.listen(PORT, () => {
			console.info("Listening on PORT:", PORT);
		});
	} catch (error) {
		console.error("Error: ", error);
		process.exit(1);
	}
};
startServer();
