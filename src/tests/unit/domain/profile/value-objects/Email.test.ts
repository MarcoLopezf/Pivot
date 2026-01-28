import { describe, it, expect } from "vitest";
import { Email } from "@domain/profile/value-objects/Email";

describe("Email", () => {
  describe("create", () => {
    it("should accept a valid email address", () => {
      const email = Email.create("user@example.com");
      expect(email.value).toBe("user@example.com");
    });

    it("should accept email with subdomain", () => {
      const email = Email.create("user@sub.domain.com");
      expect(email.value).toBe("user@sub.domain.com");
    });

    it("should accept email with plus addressing", () => {
      const email = Email.create("user+tag@example.com");
      expect(email.value).toBe("user+tag@example.com");
    });

    it("should reject email without @ symbol", () => {
      expect(() => Email.create("userexample.com")).toThrow();
    });

    it("should reject email without domain", () => {
      expect(() => Email.create("user@")).toThrow();
    });

    it("should reject email without local part", () => {
      expect(() => Email.create("@example.com")).toThrow();
    });

    it("should reject empty string", () => {
      expect(() => Email.create("")).toThrow();
    });

    it("should reject email with spaces", () => {
      expect(() => Email.create("user @example.com")).toThrow();
    });

    it("should reject email without TLD", () => {
      expect(() => Email.create("user@domain")).toThrow();
    });
  });

  describe("immutability", () => {
    it("should return the same value on repeated access", () => {
      const email = Email.create("user@example.com");
      expect(email.value).toBe(email.value);
    });

    it("should be equal to another Email with the same address", () => {
      const a = Email.create("user@example.com");
      const b = Email.create("user@example.com");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to an Email with a different address", () => {
      const a = Email.create("a@example.com");
      const b = Email.create("b@example.com");
      expect(a.equals(b)).toBe(false);
    });
  });
});
