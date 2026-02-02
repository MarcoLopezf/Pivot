import { describe, it, expect } from "vitest";
import { TagNormalizer } from "@domain/shared/services/TagNormalizer";

describe("TagNormalizer", () => {
  describe("normalize() - Single Tag", () => {
    describe("Alias Mapping", () => {
      it("should normalize 'reactjs' to 'react'", () => {
        expect(TagNormalizer.normalize("reactjs")).toBe("react");
      });

      it("should normalize 'react.js' to 'react'", () => {
        expect(TagNormalizer.normalize("react.js")).toBe("react");
      });

      it("should normalize 'Node.js' to 'node' (case insensitive)", () => {
        expect(TagNormalizer.normalize("Node.js")).toBe("node");
      });

      it("should normalize 'nodejs' to 'node'", () => {
        expect(TagNormalizer.normalize("nodejs")).toBe("node");
      });

      it("should normalize '.NET' to 'dotnet'", () => {
        expect(TagNormalizer.normalize(".NET")).toBe("dotnet");
      });

      it("should normalize 'vuejs' to 'vue'", () => {
        expect(TagNormalizer.normalize("vuejs")).toBe("vue");
      });

      it("should normalize 'nextjs' to 'next'", () => {
        expect(TagNormalizer.normalize("nextjs")).toBe("next");
      });

      it("should normalize 'postgresql' to 'postgres'", () => {
        expect(TagNormalizer.normalize("postgresql")).toBe("postgres");
      });
    });

    describe("Special Character Handling", () => {
      it("should normalize 'c++' to 'cpp'", () => {
        expect(TagNormalizer.normalize("c++")).toBe("cpp");
      });

      it("should normalize 'C++' to 'cpp' (case insensitive)", () => {
        expect(TagNormalizer.normalize("C++")).toBe("cpp");
      });

      it("should normalize 'c#' to 'csharp'", () => {
        expect(TagNormalizer.normalize("c#")).toBe("csharp");
      });

      it("should normalize 'C#' to 'csharp' (case insensitive)", () => {
        expect(TagNormalizer.normalize("C#")).toBe("csharp");
      });
    });

    describe("Stop Words Removal", () => {
      it("should remove suffix '-basics' from 'sql-basics'", () => {
        expect(TagNormalizer.normalize("sql-basics")).toBe("sql");
      });

      it("should remove prefix 'intro-to-' from 'intro-to-python'", () => {
        expect(TagNormalizer.normalize("intro-to-python")).toBe("python");
      });

      it("should remove suffix '-advanced' from 'react-advanced'", () => {
        expect(TagNormalizer.normalize("react-advanced")).toBe("react");
      });

      it("should remove 'tutorial' from 'javascript-tutorial'", () => {
        expect(TagNormalizer.normalize("javascript-tutorial")).toBe(
          "javascript",
        );
      });

      it("should remove 'fundamentals' from 'css-fundamentals'", () => {
        expect(TagNormalizer.normalize("css-fundamentals")).toBe("css");
      });

      it("should remove '101' from 'python-101'", () => {
        expect(TagNormalizer.normalize("python-101")).toBe("python");
      });

      it("should extract 'hooks' from 'advanced-hooks'", () => {
        expect(TagNormalizer.normalize("advanced-hooks")).toBe("hooks");
      });

      it("should remove 'overview' from 'docker-overview'", () => {
        expect(TagNormalizer.normalize("docker-overview")).toBe("docker");
      });

      it("should remove 'mastering' from 'mastering-typescript'", () => {
        expect(TagNormalizer.normalize("mastering-typescript")).toBe(
          "typescript",
        );
      });

      it("should remove 'guide' from 'git-guide'", () => {
        expect(TagNormalizer.normalize("git-guide")).toBe("git");
      });
    });

    describe("Combined Normalization", () => {
      it("should handle alias + stop word: 'reactjs-basics' -> 'react'", () => {
        expect(TagNormalizer.normalize("reactjs-basics")).toBe("react");
      });

      it("should handle alias + stop word: 'nodejs-tutorial' -> 'node'", () => {
        expect(TagNormalizer.normalize("nodejs-tutorial")).toBe("node");
      });

      it("should handle case + alias: 'REACTJS' -> 'react'", () => {
        expect(TagNormalizer.normalize("REACTJS")).toBe("react");
      });
    });

    describe("Sanitization", () => {
      it("should trim whitespace", () => {
        expect(TagNormalizer.normalize("  react  ")).toBe("react");
      });

      it("should remove special characters except hyphen", () => {
        expect(TagNormalizer.normalize("react@js!")).toBe("reactjs");
      });

      it("should keep hyphens in valid tags", () => {
        expect(TagNormalizer.normalize("machine-learning")).toBe(
          "machine-learning",
        );
      });
    });

    describe("Edge Cases", () => {
      it("should return empty string for null input", () => {
        expect(TagNormalizer.normalize(null as unknown as string)).toBe("");
      });

      it("should return empty string for undefined input", () => {
        expect(TagNormalizer.normalize(undefined as unknown as string)).toBe(
          "",
        );
      });

      it("should return empty string for empty string input", () => {
        expect(TagNormalizer.normalize("")).toBe("");
      });

      it("should return empty string for whitespace-only input", () => {
        expect(TagNormalizer.normalize("   ")).toBe("");
      });

      it("should handle single character tags", () => {
        expect(TagNormalizer.normalize("r")).toBe("r");
      });
    });
  });

  describe("normalizeMany() - Array of Tags", () => {
    it("should normalize multiple tags", () => {
      const input = ["reactjs", "nodejs", "typescript"];
      const expected = ["react", "node", "typescript"];
      expect(TagNormalizer.normalizeMany(input)).toEqual(expected);
    });

    it("should deduplicate normalized tags", () => {
      const input = ["reactjs", "react", "react-basics"];
      const expected = ["react"];
      expect(TagNormalizer.normalizeMany(input)).toEqual(expected);
    });

    it("should filter out empty results", () => {
      const input = ["react", "", "   ", "node"];
      const expected = ["react", "node"];
      expect(TagNormalizer.normalizeMany(input)).toEqual(expected);
    });

    it("should handle empty array", () => {
      expect(TagNormalizer.normalizeMany([])).toEqual([]);
    });

    it("should handle null/undefined in array", () => {
      const input = ["react", null as unknown as string, "node"];
      const expected = ["react", "node"];
      expect(TagNormalizer.normalizeMany(input)).toEqual(expected);
    });

    it("should return empty array for null input", () => {
      expect(TagNormalizer.normalizeMany(null as unknown as string[])).toEqual(
        [],
      );
    });

    it("should preserve order while deduplicating (keep first occurrence)", () => {
      const input = ["nodejs", "typescript", "node"];
      const expected = ["node", "typescript"];
      expect(TagNormalizer.normalizeMany(input)).toEqual(expected);
    });
  });
});
