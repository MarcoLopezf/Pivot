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

  // Onboarding fields
  private _onboardingCompleted: boolean;
  private _onboardingCompletedAt: Date | null;
  private _location: string | null;
  private _isEntryLevel: boolean;
  private _currentSeniority: string | null;
  private _yearsExperience: number | null;

  private constructor(
    id: UserId,
    email: Email,
    name: string,
    role: UserRole,
    createdAt: Date,
    onboardingCompleted: boolean = false,
    onboardingCompletedAt: Date | null = null,
    location: string | null = null,
    isEntryLevel: boolean = false,
    currentSeniority: string | null = null,
    yearsExperience: number | null = null,
  ) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._role = role;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
    this._onboardingCompleted = onboardingCompleted;
    this._onboardingCompletedAt = onboardingCompletedAt;
    this._location = location;
    this._isEntryLevel = isEntryLevel;
    this._currentSeniority = currentSeniority;
    this._yearsExperience = yearsExperience;
  }

  public static create(id: UserId, email: Email, name: string): User {
    if (name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }
    const now = new Date();
    return new User(id, email, name, UserRole.USER, now);
  }

  public static reconstitute(
    id: UserId,
    email: Email,
    name: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
    onboardingCompleted: boolean = false,
    onboardingCompletedAt: Date | null = null,
    location: string | null = null,
    isEntryLevel: boolean = false,
    currentSeniority: string | null = null,
    yearsExperience: number | null = null,
  ): User {
    const user = new User(
      id,
      email,
      name,
      role,
      createdAt,
      onboardingCompleted,
      onboardingCompletedAt,
      location,
      isEntryLevel,
      currentSeniority,
      yearsExperience,
    );
    user._updatedAt = updatedAt;
    return user;
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

  public get onboardingCompleted(): boolean {
    return this._onboardingCompleted;
  }

  public get onboardingCompletedAt(): Date | null {
    return this._onboardingCompletedAt;
  }

  public get location(): string | null {
    return this._location;
  }

  public get isEntryLevel(): boolean {
    return this._isEntryLevel;
  }

  public get currentSeniority(): string | null {
    return this._currentSeniority;
  }

  public get yearsExperience(): number | null {
    return this._yearsExperience;
  }

  public updateName(name: string): void {
    if (name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * Complete onboarding and update profile information
   */
  public completeOnboarding(
    location: string | null,
    isEntryLevel: boolean,
    yearsExperience: number,
    currentSeniority: string,
  ): void {
    this._location = location;
    this._isEntryLevel = isEntryLevel;
    this._yearsExperience = yearsExperience;
    this._currentSeniority = currentSeniority;
    this._onboardingCompleted = true;
    this._onboardingCompletedAt = new Date();
    this._updatedAt = new Date();
  }
}
