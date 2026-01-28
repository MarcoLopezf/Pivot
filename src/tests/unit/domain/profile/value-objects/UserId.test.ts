import { describe, it, expect } from "vitest";
import { UserId } from "@domain/profile/value-objects/UserId";

describe("UserId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = UserId.create("abc-123");
      expect(id.value).toBe("abc-123");
    });

    it("should accept a UUID-style string", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id = UserId.create(uuid);
      expect(id.value).toBe(uuid);
    });

    it("should reject an empty string", () => {
      expect(() => UserId.create("")).toThrow();
    });

    it("should reject a whitespace-only string", () => {
      expect(() => UserId.create("   ")).toThrow();
    });
  });

  describe("immutability", () => {
    it("should return the same value on repeated access", () => {
      const id = UserId.create("abc-123");
      expect(id.value).toBe(id.value);
    });

    it("should be equal to another UserId with the same value", () => {
      const a = UserId.create("abc-123");
      const b = UserId.create("abc-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a UserId with a different value", () => {
      const a = UserId.create("abc-123");
      const b = UserId.create("def-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
