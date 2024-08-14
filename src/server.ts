import bcrypt from "bcryptjs";
import app from "./app";
import { AppDataSource } from "./configs/data-source";
import { Config } from "./configs/envConfig";
import logger from "./configs/logger";
import { User } from "./entity/User";
import { Constants, Roles } from "./types";

const startServer = async () => {
	const PORT = Config.PORT;
	try {
		await AppDataSource.initialize();
		const userRepository = AppDataSource.getRepository(User);
		const users = await userRepository.findBy({ role: "super" });
		if (users.length === 0) {
			if (!Config.SUPER_PASS) {
				throw new Error("could not find password for SUPER ADMIN");
			}
			const hashedPassword = await bcrypt.hash(
				Config.SUPER_PASS,
				Constants.saltRounds,
			);
			const SuperADMIN = {
				name: Config.SUPER_NAME,
				email: Config.SUPER_EMAIL,
				password: hashedPassword,
				role: Roles.SUPERADMIN,
			};
			await userRepository.save({ ...SuperADMIN });
		}
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
