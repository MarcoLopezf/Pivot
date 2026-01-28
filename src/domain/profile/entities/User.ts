import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { UserRole } from "@domain/profile/entities/UserRole";

export class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _name: string;
  private readonly _role: UserRole;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: UserId,
    email: Email,
    name: string,
    role: UserRole,
    createdAt: Date,
  ) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._role = role;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
  }

  public static create(id: UserId, email: Email, name: string): User {
    if (name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }
    const now = new Date();
    return new User(id, email, name, UserRole.USER, now);
  }

  public get id(): UserId {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateName(name: string): void {
    if (name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }
    this._name = name;
    this._updatedAt = new Date();
  }
}
