import request from "supertest";
import app from "./src/app";

describe("App", () => {
	it("it should return 200 status code", async () => {
		const response = await request(app).get("/").send();
		expect(response.statusCode).toBe(200);
	});
});
