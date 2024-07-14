import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
	describe("Incomplete input fields", () => {});
});
