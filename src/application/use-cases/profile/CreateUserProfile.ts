import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { CreateUserDTO } from "@application/dtos/profile/CreateUserDTO";
import { UserDTO } from "@application/dtos/profile/UserDTO";
import { UserAlreadyExistsError } from "@domain/profile/errors/UserAlreadyExistsError";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { randomUUID } from "crypto";

export class CreateUserProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDTO): Promise<UserDTO> {
    const email = Email.create(dto.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const id = UserId.create(randomUUID());
    const user = User.create(id, email, dto.name);

    await this.userRepository.save(user);

    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
