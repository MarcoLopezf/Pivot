import {
  PrismaClient,
  LearningResource as PrismaLearningResource,
} from "@prisma/client";
import {
  IResourceRepository,
  LearningResource,
} from "@domain/learning/repositories/IResourceRepository";

/**
 * PrismaResourceRepository
 *
 * Infrastructure adapter that implements IResourceRepository using Prisma ORM.
 * Maps between Prisma models and domain LearningResource interface.
 *
 * Follows Hexagonal Architecture:
 * - Domain defines the interface (IResourceRepository)
 * - Infrastructure implements it (PrismaResourceRepository)
 */

export class PrismaResourceRepository implements IResourceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find resources by tags
   *
   * Uses Prisma's hasEvery operator to find resources
   * that contain ALL of the provided tags.
   */
  async findByTags(tags: string[]): Promise<LearningResource[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    try {
      const resources = await this.prisma.learningResource.findMany({
        where: {
          tags: {
            hasEvery: tags, // Matches only if resource contains ALL query tags
          },
        },
        orderBy: {
          votes: "desc", // Most voted first
        },
        take: 4, // Limit results
      });

      return resources.map(this.mapToDomain);
    } catch (error) {
      console.error("[PrismaResourceRepository] Error finding by tags:", error);
      return [];
    }
  }

  /**
   * Save multiple resources (bulk insert)
   *
   * Uses upsert to avoid duplicates (based on URL).
   */
  async saveMany(resources: LearningResource[]): Promise<void> {
    if (!resources || resources.length === 0) {
      return;
    }

    try {
      // Upserts in parallel — no transaction needed for independent resources
      await Promise.all(
        resources.map((resource) =>
          this.prisma.learningResource.upsert({
            where: { url: resource.url },
            update: {
              title: resource.title,
              thumbnailUrl: resource.thumbnailUrl,
              channelName: resource.channelName,
              duration: resource.duration,
              tags: resource.tags,
            },
            create: {
              title: resource.title,
              url: resource.url,
              thumbnailUrl: resource.thumbnailUrl,
              channelName: resource.channelName || "",
              duration: resource.duration,
              type: resource.type.toUpperCase() as
                | "VIDEO"
                | "ARTICLE"
                | "COURSE",
              tags: resource.tags,
            },
          }),
        ),
      );
    } catch (error) {
      console.error("[PrismaResourceRepository] Error saving many:", error);
      throw error;
    }
  }

  /**
   * Find resource by ID
   */
  async findById(id: string): Promise<LearningResource | null> {
    try {
      const resource = await this.prisma.learningResource.findUnique({
        where: { id },
      });

      return resource ? this.mapToDomain(resource) : null;
    } catch (error) {
      console.error("[PrismaResourceRepository] Error finding by ID:", error);
      return null;
    }
  }

  /**
   * Save a single resource
   */
  async save(resource: LearningResource): Promise<LearningResource> {
    try {
      const saved = await this.prisma.learningResource.upsert({
        where: { url: resource.url },
        update: {
          title: resource.title,
          thumbnailUrl: resource.thumbnailUrl,
          channelName: resource.channelName,
          duration: resource.duration,
          tags: resource.tags,
        },
        create: {
          title: resource.title,
          url: resource.url,
          thumbnailUrl: resource.thumbnailUrl,
          channelName: resource.channelName || "",
          duration: resource.duration,
          type: resource.type.toUpperCase() as "VIDEO" | "ARTICLE" | "COURSE",
          tags: resource.tags,
        },
      });

      return this.mapToDomain(saved);
    } catch (error) {
      console.error("[PrismaResourceRepository] Error saving:", error);
      throw error;
    }
  }

  /**
   * Increment vote count
   */
  async upvote(id: string): Promise<void> {
    try {
      await this.prisma.learningResource.update({
        where: { id },
        data: {
          votes: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("[PrismaResourceRepository] Error upvoting:", error);
      throw error;
    }
  }

  /**
   * Decrement vote count
   */
  async downvote(id: string): Promise<void> {
    try {
      await this.prisma.learningResource.update({
        where: { id },
        data: {
          votes: {
            decrement: 1,
          },
        },
      });
    } catch (error) {
      console.error("[PrismaResourceRepository] Error downvoting:", error);
      throw error;
    }
  }

  /**
   * Map Prisma model to domain interface
   */
  private mapToDomain(
    prismaResource: PrismaLearningResource,
  ): LearningResource {
    return {
      id: prismaResource.id,
      title: prismaResource.title,
      url: prismaResource.url,
      thumbnailUrl: prismaResource.thumbnailUrl || "",
      channelName: prismaResource.channelName || "",
      duration: prismaResource.duration ?? undefined,
      type: prismaResource.type.toLowerCase() as "video" | "article" | "course",
      tags: prismaResource.tags,
      votes: prismaResource.votes,
      createdAt: prismaResource.createdAt,
      updatedAt: prismaResource.updatedAt,
    };
  }
}
