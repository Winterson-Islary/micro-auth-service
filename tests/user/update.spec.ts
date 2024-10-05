import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { Roles } from "../../src/types";

describe("PATCH /users", () => {
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

	describe("On valid input", () => {
		it("Should return 204", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
			};
			await request(app).post("/auth/register").send(userData);

			const updateData = {
				id: "1",
				name: "Bobot",
				email: "bobot@mail.mail",
			};

			const response = await request(app)
				.patch("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(updateData);
			expect(response.statusCode).toBe(204);
		});
	});
	describe("On invalid input", () => {
		it("should return 400", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
			};
			await request(app).post("/auth/register").send(userData);

			const updateData = {
				name: "Bobot",
				email: "bobot@mail.mail",
			};

			const response = await request(app)
				.patch("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(updateData);
			expect(response.statusCode).toBe(400);
		});
	});
});
