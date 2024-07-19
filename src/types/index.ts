import type { Request } from "express";

export type UserData = {
	name: string;
	email: string;
	password: string;
};
export interface RegisterUserRequest extends Request {
	body: UserData;
}

export interface IUserService {
	create({ name, email, password }: UserData): void;
}
