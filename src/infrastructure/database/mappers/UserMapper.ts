import { type User as PrismaUser } from "@prisma/client";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    const id = UserId.create(prismaUser.id);
    const email = Email.create(prismaUser.email);
    return User.create(id, email, prismaUser.name);
  }

  static toPersistence(domainUser: User): {
    id: string;
    email: string;
    name: string;
  } {
    return {
      id: domainUser.id.value,
      email: domainUser.email.value,
      name: domainUser.name,
    };
  }
}
