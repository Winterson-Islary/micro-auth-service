//@ts-nocheck
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
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
	@Column("boolean", { default: true })
	isActive: boolean;
	@UpdateDateColumn()
	updatedAt: number;
	@CreateDateColumn()
	createdAt: number;
	@ManyToOne(() => Tenant)
	tenant: Tenant;
}
