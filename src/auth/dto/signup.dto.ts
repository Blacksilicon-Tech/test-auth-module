// Signup DTO: enforce email format + password length.
// Actual policy checks happen in service (uppercase/lowercase/number/special).
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class SignupDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "P@ssw0rd123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: "Ada Lovelace", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;
}
