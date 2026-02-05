// User identity + profile fields + security fields (lockout, failed attempts).
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ type: "varchar", length: 200 })
  passwordHash!: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean;

  // Non-sensitive profile fields
  @Column({ type: "varchar", length: 120, nullable: true })
  fullName?: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  phone?: string | null;

  // Security tracking
  @Column({ type: "int", default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: "timestamptz", nullable: true })
  lockUntil?: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
