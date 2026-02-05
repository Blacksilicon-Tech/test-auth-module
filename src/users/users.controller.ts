// "Me" endpoints: get authenticated user, update profile.
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UsersService } from "./users.service.js";
import { UpdateMeDto } from "./dto/update-me.dto.js";


@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: any) {
    return this.usersService.sanitize(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.id, dto);
  }
}
