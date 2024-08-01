//@ts-nocheck
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant";

@Entity({ name: "users" })
export class User {
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	name: string;
	@Column({ unique: true })
	email: string;
	@Column()
	password: string;
	@Column()
	role: string;
	@ManyToOne(() => Tenant)
	tenant: Tenant;
}
