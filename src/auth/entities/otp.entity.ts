// OTP entity stored hashed, with expiry and consumption timestamps.
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { OtpPurpose } from "../auth.constants";

@Entity("otps")
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ type: "enum", enum: OtpPurpose })
  purpose!: OtpPurpose;

  @Column({ type: "varchar", length: 200 })
  codeHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  user?: User | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
