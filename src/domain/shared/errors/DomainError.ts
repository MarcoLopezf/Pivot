/**
 * Base class for all domain-layer exceptions.
 *
 * Every custom error in the domain layer MUST extend this class
 * so callers can catch any domain error with a single `instanceof DomainError`.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
