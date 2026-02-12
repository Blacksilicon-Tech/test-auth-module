import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationOtpExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetOtpExpires: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
