import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { User } from "../../src/entity/User";
import { truncateTables } from "../utils/dbUtils";

describe("POST /auth/register", () => {
	let connection: DataSource;
	beforeAll(async () => {
		connection = await AppDataSource.initialize();
	});
	beforeEach(async () => {
		await truncateTables(connection);
	});
	afterAll(async () => {
		await connection.destroy();
	});
	// AAA
	describe("Complete input fields", () => {
		it("Should return 201", async () => {
			// Arrange (Data/Dependencies)
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			// Act
			const response = await request(app)
				.post("/auth/register")
				.send(userData);
			// Assert
			expect(response.statusCode).toBe(201);
		});

		it("Should return valid json", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};

			const response = await request(app)
				.post("/auth/register")
				.send(userData);
			expect(response.headers["content-type"]).toEqual(
				expect.stringContaining("json"),
			);
		});
	});
	it("should persist the user in the database", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		const _response = await request(app)
			.post("/auth/register")
			.send(userData);

		const userRepository = connection.getRepository(User);
		const users = await userRepository.find();
		expect(users).toHaveLength(1);
	});
	describe("Incomplete input fields", () => {});
});
