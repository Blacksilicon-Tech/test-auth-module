// DB operations for User entity.
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(payload: Partial<User>) {
    const user = this.usersRepo.create({
      ...payload,
      email: payload.email!.toLowerCase()
    });
    return this.usersRepo.save(user);
  }

  async save(user: User) {
    return this.usersRepo.save(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    user.fullName = dto.fullName ?? user.fullName ?? null;
    user.phone = dto.phone ?? user.phone ?? null;

    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  sanitize(user: User) {
    // Never leak passwordHash.
    const { passwordHash, ...rest } = user as any;
    return rest;
  }
}
