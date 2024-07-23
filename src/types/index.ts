import type { Request } from "express";
import type { User } from "../entity/User";

export type UserData = {
	name: string;
	email: string;
	password: string;
};
export interface RegisterUserRequest extends Request {
	body: UserData;
}
export interface LoginUserRequest extends Request {
	body: Omit<UserData, "name">;
}

export interface IUserService {
	create({ name, email, password }: UserData): Promise<User | null>;
	login({
		email,
		password,
	}: { email: string; password: string }): Promise<User | null>;
}

// CONSTANTS
export const Roles = {
	CUSTOMER: "customer",
	ADMIN: "admin",
	MANAGER: "manager",
} as const;

const saltRounds = 10;

export const Constants = { saltRounds } as const;
