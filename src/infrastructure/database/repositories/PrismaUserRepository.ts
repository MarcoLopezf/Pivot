import { type PrismaClient } from "@prisma/client";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { UserMapper } from "@infrastructure/database/mappers/UserMapper";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.db.user.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await this.db.user.findUnique({
      where: { email: email.value },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findById(id: UserId): Promise<User | null> {
    const prismaUser = await this.db.user.findUnique({
      where: { id: id.value },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }
}
