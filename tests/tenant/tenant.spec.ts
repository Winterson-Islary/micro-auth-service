import type { IncomingHttpHeaders } from "node:http";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/types";

describe("POST /tenants", () => {
	let connection: DataSource;
	let jwks: ReturnType<typeof createJWKSMock>;
	let adminToken: string;
	beforeAll(async () => {
		connection = await AppDataSource.initialize();
		jwks = createJWKSMock("http://localhost:5501");
	});
	beforeEach(async () => {
		// Truncating DB
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

	describe("On valid input fields", () => {
		it("Should return 201 status code", async () => {
			const tenantData = {
				name: "Tenant",
				address: "Tenant Address",
			};
			const response = await request(app)
				.post("/tenants/")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(tenantData);
			expect(response.statusCode).toBe(201);
		});
		it("Should create a tenant record in the database", async () => {
			const tenantData = {
				name: "Tenant",
				address: "Tenant Address",
			};
			await request(app)
				.post("/tenants/create")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(tenantData);
			const tenantRepository = connection.getRepository(Tenant);
			const tenants = await tenantRepository.find();
			expect(tenants).toHaveLength(1);
			expect(tenants[0].name).toBe(tenantData.name);
			expect(tenants[0].address).toBe(tenantData.address);
		});
		it("Should return a 403 status code, if user is not admin", async () => {
			const managerToken = jwks.token({
				sub: "1",
				role: Roles.MANAGER,
			});
			const tenantData = {
				name: "Tenant",
				address: "Tenant Address",
			};
			const response = await request(app)
				.post("/tenants/create")
				.set("Cookie", [`ACCESS_TOKEN=${managerToken};`])
				.send(tenantData);
			expect(response.statusCode).toBe(403);

			const tenantRepository = connection.getRepository(Tenant);
			const tenants = await tenantRepository.find();
			expect(tenants).toHaveLength(0);
		});
		it("Should return a tenant on valid id input", async () => {
			const tenantData = {
				name: "Tenant",
				address: "Tenant Address",
			};
			await request(app)
				.post("/tenants/create")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(tenantData);

			const getTenantResponse = await request(app)
				.get("/tenants/get")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send({ id: "1" });
			expect(getTenantResponse.statusCode).toBe(201);
		});
	});
});
