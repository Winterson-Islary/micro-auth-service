import type { IncomingHttpHeaders } from "node:http";
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
describe("POST /auth/refresh", () => {
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
	describe("On valid input fields", () => {
		it("should return status 200 on success", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			await request(app).post("/auth/register").send(userData);
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({ email: "robot@robo.mail", password: "notARobot" });
			interface Headers extends IncomingHttpHeaders {
				"set-cookie": string[];
			}
			let refreshToken: string | null = null;
			const cookies =
				(loginResponse.headers as Headers)["set-cookie"] || [];
			for (const cookie of cookies) {
				if (cookie.startsWith("REFRESH_TOKEN=")) {
					refreshToken = cookie.split(";")[0].split("=")[1];
				}
			}

			const refreshResponse = await request(app)
				.post("/auth/refresh")
				.set("Cookie", [`REFRESH_TOKEN=${refreshToken};`])
				.send();

			expect(refreshResponse.statusCode).toBe(200);
		});
		it("should return new access token on success", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			await request(app).post("/auth/register").send(userData);
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({ email: "robot@robo.mail", password: "notARobot" });
			interface Headers extends IncomingHttpHeaders {
				"set-cookie": string[];
			}
			let accessToken: string | null = null;
			let refreshToken: string | null = null;
			const cookies =
				(loginResponse.headers as Headers)["set-cookie"] || [];
			for (const cookie of cookies) {
				if (cookie.startsWith("REFRESH_TOKEN=")) {
					refreshToken = cookie.split(";")[0].split("=")[1];
				}
			}

			const refreshResponse = await request(app)
				.post("/auth/refrsh")
				.set("Cookie", [`REFRESH_TOKEN=${refreshToken};`])
				.send();
			const newCookies =
				(refreshResponse.headers as Headers)["set-cookie"] || [];
			for (const cookie of newCookies) {
				if (cookie.startsWith("ACCESS_TOKEN=")) {
					accessToken = cookie.split(";")[0].split("=")[1];
				}
			}
			expect(accessToken).toBeDefined();
		});
	});
});
