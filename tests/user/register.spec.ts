import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/types";

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
	it("should return statuscode 400 if email is already in use", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		const userRepository = connection.getRepository(User);
		await userRepository.save({ ...userData, role: Roles.CUSTOMER });
		const response = await request(app)
			.post("/auth/register")
			.send(userData);
		const users = await userRepository.find();
		expect(response.statusCode).toBe(400);
		expect(users).toHaveLength(1);
	});
	it("should save Refresh Token to Database", async () => {
		const userData = {
			name: "Robot",
			email: "robot@robo.mail",
			password: "notARobot",
		};
		const response = await request(app)
			.post("/auth/register")
			.send(userData);
		await request(app)
			.post("/auth/login")
			.send({ email: userData.email, password: userData.password });

		const refreshTokenRepository = connection.getRepository(RefreshToken);
		const refreshTokens = await refreshTokenRepository
			.createQueryBuilder()
			.where("RefreshToken.userId = :userId", {
				userId: response.body.id,
			})
			.getMany();

		expect(refreshTokens.length).toBe(1);
	});
	describe("Incomplete input fields", () => {
		it("should return status code 400 on missing inputs", async () => {
			const userData = {
				name: "",
				email: "",
				password: "",
			};
			const response = await request(app)
				.post("/auth/register")
				.send(userData);
			expect(response.statusCode).toBe(400);
			const userRepository = connection.getRepository(User);
			const users = await userRepository.find();
			expect(users).toHaveLength(0);
		});
	});
	describe("Proper input field format", () => {
		it("should remove leading and trailing whitespace from inputs", async () => {
			const userData = {
				name: "Robot",
				email: " robot@robo.mail ",
				password: "notARobot",
			};
			await request(app).post("/auth/register").send(userData);
			const userRepository = connection.getRepository(User);
			const users = await userRepository.find();
			expect(users).toHaveLength(1);
			expect(users[0].email).toBe("robot@robo.mail");
		});
		it("should return 400 on invalid email", async () => {
			const userData = {
				name: "Robot",
				email: "invalidEmail",
				password: "notARobot",
			};
			const response = await request(app)
				.post("/auth/register")
				.send(userData);
			expect(response.statusCode).toBe(400);
		});
		it("should return 400 on password length less than 8 characters", async () => {
			const userData = {
				name: "Robot",
				email: " robot@robo.mail ",
				password: "1234567",
			};
			const response = await request(app)
				.post("/auth/register")
				.send(userData);
			expect(response.statusCode).toBe(400);
		});
	});
});
