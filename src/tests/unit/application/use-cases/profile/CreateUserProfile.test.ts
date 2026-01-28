import { describe, it, expect, beforeEach } from "vitest";
import { CreateUserProfile } from "@application/use-cases/profile/CreateUserProfile";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { UserAlreadyExistsError } from "@domain/profile/errors/UserAlreadyExistsError";
import { CreateUserDTO } from "@application/dtos/profile/CreateUserDTO";

class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((u) => u.email.value === email.value) ?? null;
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.find((u) => u.id.value === id.value) ?? null;
  }
}

describe("CreateUserProfile", () => {
  let repository: MockUserRepository;
  let useCase: CreateUserProfile;

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new CreateUserProfile(repository);
  });

  it("should create a user successfully when email is unique", async () => {
    const dto: CreateUserDTO = {
      name: "John Doe",
      email: "john@example.com",
    };

    const result = await useCase.execute(dto);

    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.id).toBeDefined();
    expect(result.role).toBe("USER");
  });

  it("should throw UserAlreadyExistsError if email is already taken", async () => {
    const dto: CreateUserDTO = {
      name: "John Doe",
      email: "john@example.com",
    };

    await useCase.execute(dto);

    await expect(useCase.execute(dto)).rejects.toThrow(UserAlreadyExistsError);
  });
});
