import type { IncomingHttpHeaders } from "node:http";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";

describe("POST /tenants", () => {
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
		it("Should return 201 status code", async () => {
			const tenantData = {
				name: "Tenant",
				address: "Tenant Address",
			};
			const response = await request(app)
				.post("/tenants/")
				.send(tenantData);
			expect(response.statusCode).toBe(201);
		});
	});
});
