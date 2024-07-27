import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/types";

describe("GET /auth/whoami", () => {
	let connection: DataSource;
	let jwks: ReturnType<typeof createJWKSMock>;
	beforeAll(async () => {
		connection = await AppDataSource.initialize();
		jwks = createJWKSMock("http://localhost:5501");
	});
	beforeEach(async () => {
		jwks.start();
		// Truncating DB
		await connection.dropDatabase();
		await connection.synchronize();
	});
	afterEach(() => {
		jwks.stop();
	});
	afterAll(async () => {
		await connection.destroy();
	});

	describe("On valid input fields", () => {
		it("should return status code 200", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			const userRepository = connection.getRepository(User);
			const data = await userRepository.save({
				...userData,
				role: Roles.CUSTOMER,
			});
			const mockAccessToken = jwks.token({
				sub: String(data.id),
				role: data.role,
			});
			const response = await request(app)
				.get("/auth/whoami")
				.set("Cookie", [`ACCESS_TOKEN=${mockAccessToken};`])
				.send();
			expect(response.statusCode).toBe(200);
		});
		it("should return the user data and without password", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			const userRepository = connection.getRepository(User);
			const data = await userRepository.save({
				...userData,
				role: Roles.CUSTOMER,
			});
			const mockAccessToken = jwks.token({
				sub: String(data.id),
				role: data.role,
			});
			const response = await request(app)
				.get("/auth/whoami")
				.set("Cookie", [`ACCESS_TOKEN=${mockAccessToken};`])
				.send();

			expect(response.body.id).toBe(data.id);
			expect(response.body).not.toHaveProperty("password");
		});
		it("should return 401 status code in case of missing access token", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			const userRepository = connection.getRepository(User);
			await userRepository.save({
				...userData,
				role: Roles.CUSTOMER,
			});
			const response = await request(app).get("/auth/whoami").send();
			expect(response.statusCode).toBe(401);
		});
	});
});
