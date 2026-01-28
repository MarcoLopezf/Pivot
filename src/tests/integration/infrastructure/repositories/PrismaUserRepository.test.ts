import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaUserRepository } from "@infrastructure/database/repositories/PrismaUserRepository";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Email } from "@domain/profile/value-objects/Email";
import { User } from "@domain/profile/entities/User";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "PrismaUserRepository (integration) — requires DATABASE_URL",
  () => {
    let db: PrismaClient;
    let pool: Pool;
    let repository: PrismaUserRepository;

    beforeEach(async () => {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      db = new PrismaClient({ adapter });
      repository = new PrismaUserRepository(db);
      await db.user.deleteMany();
    });

    afterAll(async () => {
      await db.$disconnect();
      await pool.end();
    });

    it("should save a user and retrieve it by ID", async () => {
      const id = UserId.create("test-id-001");
      const email = Email.create("integration@example.com");
      const user = User.create(id, email, "Integration User");

      await repository.save(user);

      const found = await repository.findById(id);

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe("test-id-001");
      expect(found!.email.value).toBe("integration@example.com");
      expect(found!.name).toBe("Integration User");
    });

    it("should return null when user is not found by ID", async () => {
      const id = UserId.create("non-existent-id");

      const found = await repository.findById(id);

      expect(found).toBeNull();
    });

    it("should return null when user is not found by email", async () => {
      const email = Email.create("ghost@example.com");

      const found = await repository.findByEmail(email);

      expect(found).toBeNull();
    });

    it("should find a user by email after saving", async () => {
      const id = UserId.create("test-id-002");
      const email = Email.create("byemail@example.com");
      const user = User.create(id, email, "Email User");

      await repository.save(user);

      const found = await repository.findByEmail(email);

      expect(found).not.toBeNull();
      expect(found!.email.value).toBe("byemail@example.com");
    });
  },
);
