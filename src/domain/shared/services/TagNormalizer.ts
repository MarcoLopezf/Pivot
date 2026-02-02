/**
 * TagNormalizer
 *
 * Domain service for normalizing tags into atomic, canonical forms.
 * Cleans dirty tags like "reactjs-basics" into atomic "react".
 *
 * Rules:
 * 1. Lowercase & trim
 * 2. Apply alias mapping (e.g., "reactjs" -> "react")
 * 3. Remove stop words (e.g., "basics", "tutorial", "101")
 * 4. Remove special characters (keep only a-z, 0-9, -)
 */
export class TagNormalizer {
  /**
   * Stop words to remove from tags
   */
  private static readonly STOP_WORDS = [
    "intro",
    "introduction",
    "basics",
    "basic",
    "advanced",
    "tutorial",
    "guide",
    "101",
    "fundamentals",
    "overview",
    "concept",
    "concepts",
    "mastering",
  ];

  /**
   * Alias map for canonical tag names
   */
  private static readonly ALIAS_MAP: Record<string, string> = {
    // --- LENGUAJES DE PROGRAMACIÓN ---
    // JavaScript / TypeScript
    js: "javascript",
    ts: "typescript",
    es6: "javascript",
    ecmascript: "javascript",

    // Python
    py: "python",
    python3: "python",

    // Java
    java8: "java",
    java11: "java",
    java17: "java",
    jdk: "java",

    // C# / .NET
    "c#": "csharp",
    csharp: "csharp", // Aseguramos idempotencia
    ".net": "dotnet",
    dotnet: "dotnet",
    "asp.net": "aspnet",
    aspnetcore: "aspnet",

    // C++ / C
    "c++": "cpp",
    cpp: "cpp",
    cplusplus: "cpp",
    "obj-c": "objective-c",
    objectivec: "objective-c",

    // Go / Rust / PHP
    golang: "go",
    "rust-lang": "rust",
    php7: "php",
    php8: "php",

    // --- FRONTEND ---
    // Frameworks
    reactjs: "react",
    "react.js": "react",
    vuejs: "vue",
    "vue.js": "vue",
    nextjs: "next",
    "next.js": "next",
    nuxtjs: "nuxt",
    "nuxt.js": "nuxt",
    angularjs: "angular", // Normalizamos a la versión moderna
    sveltejs: "svelte",

    // Estilos
    css3: "css",
    html5: "html",
    scss: "sass",
    tailwind: "tailwindcss",
    "tailwind-css": "tailwindcss",
    bootstrap5: "bootstrap",
    "material-ui": "mui",

    // --- BACKEND ---
    // Node.js
    nodejs: "node",
    "node.js": "node",
    expressjs: "express",
    "express.js": "express",
    nestjs: "nest",
    "nest.js": "nest",

    // Python
    "django-framework": "django",
    "flask-framework": "flask",
    fastapi: "fastapi", // Ya es limpio, pero por seguridad

    // Java
    "spring-boot": "spring",
    springboot: "spring",
    "spring-framework": "spring",

    // --- BASE DE DATOS ---
    // SQL
    postgresql: "postgres",
    pg: "postgres",
    mysql: "mysql", // my-sql lo limpia el regex
    mssql: "sql-server",
    sqlserver: "sql-server",
    "oracle-db": "oracle",

    // NoSQL
    mongodb: "mongo",
    "mongo-db": "mongo",
    dynamodb: "dynamo",
    cosmosdb: "cosmos",
    "redis-db": "redis",
    "cassandra-db": "cassandra",

    // --- DEVOPS & CLOUD ---
    // AWS
    "amazon-web-services": "aws",
    "aws-cloud": "aws",
    lambda: "aws-lambda", // Específico para evitar ambigüedad con python lambda
    ec2: "aws-ec2",

    // Google Cloud
    gcp: "google-cloud",
    "google-cloud-platform": "google-cloud",

    // Azure
    "ms-azure": "azure",
    "microsoft-azure": "azure",

    // Contenedores
    k8s: "kubernetes",
    kube: "kubernetes",
    "docker-container": "docker",
    containers: "docker", // Asunción segura para tutoriales

    // CI/CD
    "github-actions": "gh-actions",
    "jenkins-ci": "jenkins",
    "gitlab-ci": "gitlab",

    // --- CONCEPTOS & ARQUITECTURA ---
    "rest-api": "rest",
    restful: "rest",
    "graphql-api": "graphql",
    gql: "graphql",
    "micro-services": "microservices",
    ddd: "domain-driven-design",
    tdd: "test-driven-development",
    oop: "object-oriented-programming",
    fp: "functional-programming",
    "mvc-pattern": "mvc",
    "system-design": "architecture",

    // --- ANALYTICS & DATA ---
    "data-analytics": "data-analysis",
    analytics: "data-analysis",
    ml: "machine-learning",
    ai: "artificial-intelligence",
    dl: "deep-learning",
    nlp: "natural-language-processing",
    llm: "large-language-model",
  };
  /**
   * Normalize a single tag to its canonical form
   */
  static normalize(input: string): string {
    // Handle null/undefined/empty
    if (!input || typeof input !== "string") {
      return "";
    }

    // Step 1: Lowercase & trim
    let tag = input.toLowerCase().trim();

    if (tag === "") {
      return "";
    }

    // Step 2: Check alias map FIRST (before any cleaning)
    // This is crucial for handling special characters like c# and c++
    if (this.ALIAS_MAP[tag]) {
      tag = this.ALIAS_MAP[tag];
    }

    // Step 3: Remove stop words (as prefixes and suffixes)
    tag = this.removeStopWords(tag);

    // Step 4: Check alias again after stop word removal
    // e.g., "reactjs-basics" -> "reactjs" -> "react"
    if (this.ALIAS_MAP[tag]) {
      tag = this.ALIAS_MAP[tag];
    }

    // Step 5: Sanitize - remove special chars except hyphen
    tag = tag.replace(/[^a-z0-9-]/g, "");

    // Step 6: Clean up multiple hyphens and leading/trailing hyphens
    tag = tag.replace(/-+/g, "-").replace(/^-|-$/g, "");

    return tag;
  }

  /**
   * Normalize an array of tags, with deduplication
   */
  static normalizeMany(tags: string[]): string[] {
    // Handle null/undefined
    if (!tags || !Array.isArray(tags)) {
      return [];
    }

    const seen = new Set<string>();
    const result: string[] = [];

    for (const tag of tags) {
      const normalized = this.normalize(tag);

      // Skip empty results
      if (!normalized) {
        continue;
      }

      // Skip duplicates (keep first occurrence)
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      result.push(normalized);
    }

    return result;
  }

  /**
   * Remove stop words from tag (handles prefix and suffix patterns)
   */
  private static removeStopWords(tag: string): string {
    let result = tag;

    for (const stopWord of this.STOP_WORDS) {
      // Remove as prefix with hyphen: "intro-to-python" -> "to-python" -> "python"
      const prefixPattern = new RegExp(`^${stopWord}-`, "gi");
      result = result.replace(prefixPattern, "");

      // Remove as suffix with hyphen: "sql-basics" -> "sql"
      const suffixPattern = new RegExp(`-${stopWord}$`, "gi");
      result = result.replace(suffixPattern, "");
    }

    // Handle "to" as a stop word separately (common in "intro-to-X")
    result = result.replace(/^to-/, "");

    return result;
  }
}
