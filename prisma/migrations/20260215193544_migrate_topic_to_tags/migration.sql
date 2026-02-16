-- AlterTable: Migrate RoadmapItem from topic (string) to tags (array)
-- Step 1: Add tags column with empty array default
ALTER TABLE "RoadmapItem" ADD COLUMN "tags" TEXT[] DEFAULT '{}';

-- Step 2: Migrate existing topic data to tags array
-- Convert single topic string to lowercase tag in array
UPDATE "RoadmapItem"
SET "tags" = ARRAY[LOWER(TRIM("topic"))]
WHERE "topic" IS NOT NULL AND "topic" != '';

-- Step 3: Drop the old topic column
ALTER TABLE "RoadmapItem" DROP COLUMN "topic";
