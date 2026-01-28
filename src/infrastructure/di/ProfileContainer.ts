import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaUserRepository } from "@infrastructure/database/repositories/PrismaUserRepository";
import { CreateUserProfile } from "@application/use-cases/profile/CreateUserProfile";

/**
 * ProfileContainer - Dependency Injection Container for Profile bounded context
 *
 * This container follows the Composition Root pattern, wiring up dependencies
 * for the Profile domain. It ensures that:
 * - Database connections are reused (Prisma client singleton)
 * - Use cases are initialized once per container access
 * - Dependencies flow inward (Infrastructure -> Application -> Domain)
 */

class ProfileContainer {
  private userRepository: PrismaUserRepository;

  constructor() {
    // Initialize infrastructure dependencies
    this.userRepository = new PrismaUserRepository(prisma);
  }

  /**
   * Returns an initialized CreateUserProfile use case with all dependencies injected
   */
  getCreateUserProfileUseCase(): CreateUserProfile {
    return new CreateUserProfile(this.userRepository);
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const profileContainer = new ProfileContainer();

export { profileContainer };
