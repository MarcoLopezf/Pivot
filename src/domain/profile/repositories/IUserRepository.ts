import { Email } from "@domain/profile/value-objects/Email";
import { User } from "@domain/profile/entities/User";
import { UserId } from "@domain/profile/value-objects/UserId";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
}
