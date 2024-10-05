import createJWKSMock from "mock-jwks";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/configs/data-source";
import { Tenant } from "../../src/entity/Tenant";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/types";
import { createTenant } from "../utils/testUtils";

describe("POST /users", () => {
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
		it("Should create an user record on success", async () => {
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
			const userRepository = connection.getRepository(User);
			const users: User[] = await userRepository.find();
			expect(users).toHaveLength(1);
			expect((users[0] as User).role).toBe(Roles.MANAGER);
		});
		it("Should map user with a valid tenant", async () => {
			const tenantData = await createTenant(
				connection.getRepository(Tenant),
			);
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
				tenantId: tenantData.id,
			};
			await request(app)
				.post("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(userData);
			const userRepository = connection.getRepository(User);
			const users: User[] = await userRepository.find();
			expect(users).toHaveLength(1);
		});
		it("Should return status code 403 when non admin tries to create an user", async () => {
			const nonAdmin = jwks.token({
				sub: "1",
				role: Roles.MANAGER,
			});
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
			};
			const response = await request(app)
				.post("/users")
				.set("Cookie", [`ACCESS_TOKEN=${nonAdmin};`])
				.send(userData);
			expect(response.statusCode).toBe(403);
			const userRepository = connection.getRepository(User);
			const users: User[] = await userRepository.find();
			expect(users).toHaveLength(0);
		});
		it("Should delete user when passed a valid id", async () => {
			const tenantData = await createTenant(
				connection.getRepository(Tenant),
			);
			const userData = {
				name: "Robot",
				email: "robot@robo.mail",
				password: "notARobot",
				role: Roles.MANAGER,
				tenantId: tenantData.id,
			};
			await request(app)
				.post("/users")
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send(userData);
			const userRepository = connection.getRepository(User);
			const users: User[] = await userRepository.find();
			const userID = (users[0] as User).id;
			const delete_request = await request(app)
				.delete(`/users/${userID}`)
				.set("Cookie", [`ACCESS_TOKEN=${adminToken};`])
				.send();
			expect(delete_request.statusCode).toBe(204);
			const deleted_user: User[] = await userRepository.find();
			expect(deleted_user).toHaveLength(0);
		});
	});
});
