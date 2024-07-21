import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/types";
import { truncateTables } from "../utils/dbUtils";

describe("POST /auth/register", () => {
	let connection: DataSource;
	beforeAll(async () => {
		connection = await AppDataSource.initialize();
	});
	beforeEach(async () => {
		// Truncating DB
		await connection.dropDatabase();
		await connection.synchronize();
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
		await request(app).post("/auth/register").send(userData);

		const userRepository = connection.getRepository(User);
		const users = await userRepository.find();
		expect(users).toHaveLength(1);
	});
	it("should return id of the created user", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		const response = await request(app)
			.post("/auth/register")
			.send(userData);
		expect(response.body.id).not.toBeNaN;
	});
	it("should have role set to customer", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		await request(app).post("/auth/register").send(userData);
		const userRepository = connection.getRepository(User);
		const users = await userRepository.find();
		expect(users[0]).toHaveProperty("role");
		expect(users[0].role).toBe(Roles.CUSTOMER);
	});
	it("should store hashed password in the database", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		await request(app).post("/auth/register").send(userData);
		const userRepository = connection.getRepository(User);
		const users = await userRepository.find();

		expect(users[0].password).not.toBe(userData.password);
		expect(users[0].password).toHaveLength(60);
		expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
	});
	describe("Incomplete input fields", () => {});
});
