import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { RefreshToken } from "../entity/RefreshToken";
import type { User } from "../entity/User";

export type UserData = {
	name: string;
	email: string;
	password: string;
};
export interface RequestAuth extends Request {
	auth: {
		sub: string;
		role: string;
	};
}
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
	findById(id: number): Promise<User | null>;
}
export interface ITokenService {
	generateAccessToken(payload: JwtPayload): string;
	generateRefreshToken(payload: JwtPayload): string;
	persistRefreshToken(user: User): Promise<RefreshToken>;
}
// CONSTANTS
export const Roles = {
	CUSTOMER: "customer",
	ADMIN: "admin",
	MANAGER: "manager",
} as const;

const saltRounds = 10;

export const Constants = { saltRounds } as const;
