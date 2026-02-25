import { DomainError } from "@domain/shared/errors/DomainError";

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "UserAlreadyExistsError";
  }
}
