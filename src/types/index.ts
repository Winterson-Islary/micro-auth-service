import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { RefreshToken } from "../entity/RefreshToken";
import type { Tenant } from "../entity/Tenant";
import type { User } from "../entity/User";

export type UserData = {
	name: string;
	email: string;
	password: string;
	role?: string;
	tenantId?: number;
};
export interface RequestAuth extends Request {
	auth: {
		sub: string;
		role: string;
	};
}
export interface RefreshAuth extends Request {
	auth: {
		id?: string;
		sub: string;
		role: string;
		isRevoked: boolean;
	};
}
export interface RegisterUserRequest extends Request {
	body: UserData;
}
export interface LoginUserRequest extends Request {
	body: Omit<UserData, "name">;
}

export interface IUserService {
	create({
		name,
		email,
		password,
		role,
		tenantId,
	}: UserData): Promise<User | null>;
	login({
		email,
		password,
	}: { email: string; password: string }): Promise<User | null>;
	findById(id: number): Promise<User | null>;
	getAll(): Promise<User[] | null>;
}
export interface ITokenService {
	generateAccessToken(payload: JwtPayload): string;
	generateRefreshToken(payload: JwtPayload): string;
	persistRefreshToken(user: User): Promise<RefreshToken>;
	deleteRefreshToken(id: number): Promise<void>;
}
export type TenantData = {
	name: string;
	address: string;
};
export interface TenantRequest extends Request {
	body: TenantData;
}
export type getTenantData = {
	id: string;
};
export interface GetTenantRequest extends Request {
	body: getTenantData;
}
export interface ITenantService {
	create({ name, address }: TenantData): Promise<void>;
	getById(id: number): Promise<Tenant | null>;
	getAll(): Promise<Tenant[] | null>;
}

export type AdminRequest = {
	body: {
		name: string;
		email: string;
		password: string;
		role: string;
		tenantId: string;
	};
};
export interface IAdminService {
	create({
		name,
		email,
		password,
	}: {
		name: string;
		email: string;
		password: string;
	}): Promise<void>;
}
// CONSTANTS
export const Roles = {
	CUSTOMER: "customer",
	ADMIN: "admin",
	MANAGER: "manager",
	SUPERADMIN: "super",
} as const;

const saltRounds = 10;

export const Constants = { saltRounds } as const;
