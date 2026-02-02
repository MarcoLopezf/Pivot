/**
 * IResourceRepository
 *
 * Domain repository interface for learning resources (videos, articles, courses).
 * Follows Repository Pattern - abstracts data persistence from domain logic.
 *
 * Infrastructure layer implements this interface (e.g., PrismaResourceRepository).
 */

/**
 * Learning Resource Data Structure
 */
export interface LearningResource {
  id?: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  channelName: string;
  duration?: string;
  type: "video" | "article" | "course";
  tags: string[];
  votes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Repository interface for learning resources
 */
export interface IResourceRepository {
  /**
   * Find resources by tags (for lazy loading)
   * Returns resources that match ANY of the provided tags
   */
  findByTags(tags: string[]): Promise<LearningResource[]>;

  /**
   * Save multiple resources (bulk insert for API results)
   */
  saveMany(resources: LearningResource[]): Promise<void>;

  /**
   * Find a single resource by ID
   */
  findById(id: string): Promise<LearningResource | null>;

  /**
   * Save a single resource
   */
  save(resource: LearningResource): Promise<LearningResource>;

  /**
   * Increment vote count
   */
  upvote(id: string): Promise<void>;

  /**
   * Decrement vote count
   */
  downvote(id: string): Promise<void>;
}
