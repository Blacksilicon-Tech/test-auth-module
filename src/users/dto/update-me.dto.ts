// Update user profile (non-sensitive fields only), per spec.
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMeDto {
  @ApiPropertyOptional({ example: "Ada Lovelace" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({ example: "08012345678" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
