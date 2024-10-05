import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
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
		adminToken = jwks.token({
			sub: "1",
			role: Roles.ADMIN,
		});
		await connection.dropDatabase();
		await connection.synchronize();
	});
	afterEach(async () => {
		jwks.stop();
	});
	afterAll(async () => {
		await connection.destroy();
	});

	describe("On valid pagination input", () => {
		it("Should return 200", async () => {
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
			const queryString =
				"/users?curPage=10&perPage=7&user=Robot&role=manager";
			const response = await request(app)
				.get(queryString)
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`]);
			expect(response.statusCode).toBe(200);
		});
	});
});
