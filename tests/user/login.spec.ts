import type { IncomingHttpHeaders } from "node:http";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { isValidJWT } from "../utils/testUtils";

describe("POST /auth/login", () => {
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
		it("should have valid access and refresh tokens inside the cookie", async () => {
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
			};
			await request(app).post("/auth/register").send(userData);
			const response = await request(app)
				.post("/auth/login")
				.send({ email: "robot@robo.mail", password: "notARobot" });
			interface Headers extends IncomingHttpHeaders {
				"set-cookie": string[];
			}
			let accessToken: string | null = null;
			let refreshToken: string | null = null;
			const cookies = (response.headers as Headers)["set-cookie"] || [];
			for (const cookie of cookies) {
				if (cookie.startsWith("ACCESS_TOKEN=")) {
					accessToken = cookie.split(";")[0].split("=")[1];
				}
				if (cookie.startsWith("REFRESH_TOKEN=")) {
					refreshToken = cookie.split(";")[0].split("=")[1];
				}
			}
			expect(accessToken).not.toBeNaN();
			expect(isValidJWT(accessToken)).toBeTruthy();
			expect(refreshToken).not.toBeNull();
			expect(isValidJWT(refreshToken)).toBeTruthy();
		});
	});
});
