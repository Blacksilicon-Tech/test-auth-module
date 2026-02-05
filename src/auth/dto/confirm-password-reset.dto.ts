// Confirm reset using OTP + new password.
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length, MaxLength, MinLength } from "class-validator";

export class ConfirmPasswordResetDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ example: "N3wP@ssword!" })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}
