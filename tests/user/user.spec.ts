import type { IncomingHttpHeaders } from "node:http";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { User } from "../../src/entity/User";
import { TokenService } from "../../src/services/TokenService";
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
				.post("/auth/refresh")
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

describe("POST /auth/logout", () => {
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
	describe("on valid input", () => {
		it("should return 200 on successful logout", async () => {
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
			const refreshRepository = connection.getRepository(RefreshToken);
			const ThirtyDays = 1000 * 60 * 60 * 24 * 30;
			const refreshRepositoryResponse = await refreshRepository.save({
				user: data,
				expiresAt: new Date(Date.now() + ThirtyDays),
			});
			const tokenService = new TokenService(refreshRepository);
			const mockAccessToken = jwks.token({
				sub: String(data.id),
				role: data.role,
			});
			const mockRefreshToken = tokenService.generateRefreshToken({
				sub: String(data.id),
				role: data.role,
				id: refreshRepositoryResponse.id,
			});

			const logoutResponse = await request(app)
				.post("/auth/logout")
				.set("Cookie", [
					`ACCESS_TOKEN=${mockAccessToken};REFRESH_TOKEN=${mockRefreshToken};`,
				])
				.send();
			expect(logoutResponse.statusCode).toBe(200);
		});

		it("should clear access and refresh token on success", async () => {
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
			const refreshRepository = connection.getRepository(RefreshToken);
			const ThirtyDays = 1000 * 60 * 60 * 24 * 30;
			const refreshRepositoryResponse = await refreshRepository.save({
				user: data,
				expiresAt: new Date(Date.now() + ThirtyDays),
			});
			const tokenService = new TokenService(refreshRepository);
			const mockAccessToken = jwks.token({
				sub: String(data.id),
				role: data.role,
			});
			const mockRefreshToken = tokenService.generateRefreshToken({
				sub: String(data.id),
				role: data.role,
				id: refreshRepositoryResponse.id,
			});

			const logoutResponse = await request(app)
				.post("/auth/logout")
				.set("Cookie", [
					`ACCESS_TOKEN=${mockAccessToken};REFRESH_TOKEN=${mockRefreshToken};`,
				])
				.send();
			interface Headers extends IncomingHttpHeaders {
				"set-cookie": string[];
			}
			let accessToken: string | null = null;
			let refreshToken: string | null = null;
			const cookies =
				(logoutResponse.headers as Headers)["set-cookie"] || [];
			for (const cookie of cookies) {
				if (cookie.startsWith("ACCESS_TOKEN=")) {
					accessToken = cookie.split(";")[0].split("=")[1];
				}
				if (cookie.startsWith("REFRESH_TOKEN=")) {
					refreshToken = cookie.split(";")[0].split("=")[1];
				}
			}

			expect(accessToken).toBe("");
			expect(refreshToken).toBe("");
		});
	});
});
