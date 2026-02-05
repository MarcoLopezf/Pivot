import {
  type User as PrismaUser,
  UserRole as PrismaUserRole,
} from "@prisma/client";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { UserRole } from "@domain/profile/entities/UserRole";

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    const id = UserId.create(prismaUser.id);
    const email = Email.create(prismaUser.email);
    const role = prismaUser.role as UserRole;
    return User.reconstitute(
      id,
      email,
      prismaUser.name,
      role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.onboardingCompleted,
      prismaUser.onboardingCompletedAt,
      prismaUser.location,
      prismaUser.isEntryLevel,
      prismaUser.currentSeniority,
      prismaUser.yearsExperience,
    );
  }

  static toPersistence(domainUser: User): {
    id: string;
    email: string;
    name: string;
    role: PrismaUserRole;
    createdAt: Date;
    updatedAt: Date;
    onboardingCompleted: boolean;
    onboardingCompletedAt: Date | null;
    location: string | null;
    isEntryLevel: boolean;
    currentSeniority: string | null;
    yearsExperience: number | null;
  } {
    return {
      id: domainUser.id.value,
      email: domainUser.email.value,
      name: domainUser.name,
      role: domainUser.role as PrismaUserRole,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
      onboardingCompleted: domainUser.onboardingCompleted,
      onboardingCompletedAt: domainUser.onboardingCompletedAt,
      location: domainUser.location,
      isEntryLevel: domainUser.isEntryLevel,
      currentSeniority: domainUser.currentSeniority,
      yearsExperience: domainUser.yearsExperience,
    };
  }
}
