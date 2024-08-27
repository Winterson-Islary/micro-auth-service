import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import type { User } from "../../src/entity/User";
import { Roles } from "../../src/types";

describe("GET /users", () => {
	let connection: DataSource;
	let jwks: ReturnType<typeof createJWKSMock>;
	let adminToken: string;

	beforeAll(async () => {
		connection = await AppDataSource.initialize();
		jwks = createJWKSMock("http://localhost:5501");
	});
	beforeEach(async () => {
		jwks.start();
		await connection.dropDatabase();
		await connection.synchronize();
		adminToken = jwks.token({
			sub: "1",
			role: Roles.ADMIN,
		});
	});
	afterEach(async () => {
		jwks.stop();
	});
	afterAll(async () => {
		await connection.destroy();
	});

	describe("On valid input values", () => {
		it("should return 200 status code", async () => {
			const response = await request(app)
				.get("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send();
			expect(response.statusCode).toBe(200);
		});
		it("should return list of users", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
			};
			await request(app)
				.post("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(userData);

			const response = await request(app)
				.get("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send();
			const { users } = response.body;
			expect(users).toHaveLength(1);
		});
		it("should not return password field", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
			};
			await request(app)
				.post("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(userData);

			const response = await request(app)
				.get("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send();
			const { users } = response.body;
			expect(users[0] as User).not.toHaveProperty("password");
		});
	});
});
