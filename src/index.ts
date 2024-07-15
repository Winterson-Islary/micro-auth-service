import { AppDataSource } from "./configs/data-source";
import logger from "./configs/logger";
import { User } from "./entity/User";

AppDataSource.initialize()
	.then(async () => {
		logger.info("Inserting a new user into the database...");
		const user = new User();
		user.firstName = "Timber";
		user.lastName = "Saw";
		user.age = 25;
		await AppDataSource.manager.save(user);
		logger.info(`Saved a new user with id:  ${user.id}`);

		logger.info("Loading users from the database...");
		const users = await AppDataSource.manager.find(User);
		logger.info("Loaded users: ", users);

		logger.info(
			"Here you can setup and run express / fastify / any other framework.",
		);
	})
	.catch((error) => logger.error(error));
