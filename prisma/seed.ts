/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Prisma Seed Script
 *
 * Populates the database with initial test data for development.
 * Run with: pnpm prisma db seed
 *
 * @layer Infrastructure
 */
async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (optional - comment out if you want to preserve data)
  console.log("🧹 Cleaning existing data...");
  await prisma.projectSubmission.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.onboardingProgress.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.learningResource.deleteMany();
  await prisma.user.deleteMany();

  // Create Test Users with varied profiles
  console.log("👤 Creating users...");

  const user1 = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Alex Student",
      role: "USER",
      onboardingCompleted: true,
      onboardingCompletedAt: new Date("2024-01-15"),
      location: "Argentina",
      isEntryLevel: true,
      currentSeniority: "JUNIOR",
      yearsExperience: 0,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "developer@example.com",
      name: "Jordan Developer",
      role: "USER",
      onboardingCompleted: true,
      onboardingCompletedAt: new Date("2024-01-10"),
      location: "North America",
      isEntryLevel: false,
      currentSeniority: "MID",
      yearsExperience: 3,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "designer@example.com",
      name: "Sam Designer",
      role: "USER",
      onboardingCompleted: false, // Still in onboarding
      location: "Europe",
      isEntryLevel: true,
      currentSeniority: "JUNIOR",
      yearsExperience: 1,
    },
  });

  console.log("✅ Created users:", {
    user1: user1.email,
    user2: user2.email,
    user3: user3.email,
  });

  // Create Career Goals
  console.log("🎯 Creating career goals...");

  const goal1 = await prisma.careerGoal.create({
    data: {
      userId: user1.id,
      targetRole: "Full Stack Developer",
      currentRole: "Student",
    },
  });

  const goal2 = await prisma.careerGoal.create({
    data: {
      userId: user2.id,
      targetRole: "Senior Backend Engineer",
      currentRole: "Mid-Level Developer",
    },
  });

  console.log("✅ Created career goals");

  // Create Roadmaps
  console.log("🗺️ Creating roadmaps...");

  const _roadmap1 = await prisma.roadmap.create({
    data: {
      goalId: goal1.id,
      title: "Path to Full Stack Development",
      items: {
        create: [
          {
            title: "Learn React Fundamentals",
            description: "Master React components, hooks, and state management",
            order: 1,
            status: "COMPLETED",
            type: "THEORY",
            topic: "React",
            difficulty: "beginner",
          },
          {
            title: "Build a Todo App",
            description: "Create a full-featured todo application with React",
            order: 2,
            status: "IN_PROGRESS",
            type: "PROJECT",
            topic: "React",
            difficulty: "beginner",
          },
          {
            title: "Learn Node.js & Express",
            description: "Backend development with Node.js and Express",
            order: 3,
            status: "PENDING",
            type: "THEORY",
            topic: "Node.js",
            difficulty: "intermediate",
          },
        ],
      },
    },
  });

  const _roadmap2 = await prisma.roadmap.create({
    data: {
      goalId: goal2.id,
      title: "Advanced Backend Engineering",
      items: {
        create: [
          {
            title: "Master System Design",
            description: "Learn scalability, microservices, and distributed systems",
            order: 1,
            status: "IN_PROGRESS",
            type: "THEORY",
            topic: "System Design",
            difficulty: "advanced",
          },
          {
            title: "Build a Scalable API",
            description: "Design and implement a production-grade REST API",
            order: 2,
            status: "PENDING",
            type: "PROJECT",
            topic: "Backend",
            difficulty: "advanced",
          },
        ],
      },
    },
  });

  console.log("✅ Created roadmaps");

  // Create Learning Resources
  console.log("📚 Creating learning resources...");

  await prisma.learningResource.createMany({
    data: [
      {
        title: "React Complete Course 2024",
        url: "https://youtube.com/watch?v=example1",
        thumbnailUrl: "https://i.ytimg.com/vi/example1/maxresdefault.jpg",
        channelName: "Code Academy",
        duration: "3:45:30",
        type: "VIDEO",
        tags: ["react", "javascript", "frontend"],
        votes: 150,
      },
      {
        title: "Node.js Best Practices",
        url: "https://dev.to/nodejs-best-practices",
        type: "ARTICLE",
        tags: ["nodejs", "backend", "best-practices"],
        votes: 89,
      },
      {
        title: "System Design Masterclass",
        url: "https://youtube.com/watch?v=example2",
        thumbnailUrl: "https://i.ytimg.com/vi/example2/maxresdefault.jpg",
        channelName: "Tech Interview Pro",
        duration: "2:15:00",
        type: "VIDEO",
        tags: ["system-design", "architecture", "scalability"],
        votes: 234,
      },
    ],
  });

  console.log("✅ Created learning resources");

  // Create Questions for Quizzes
  console.log("❓ Creating quiz questions...");

  const _question1 = await prisma.question.create({
    data: {
      text: "What is the purpose of React hooks?",
      tags: ["react", "hooks"],
      difficulty: "beginner",
      usageCount: 0,
      options: {
        create: [
          {
            text: "To add state and lifecycle features to functional components",
            isCorrect: true,
          },
          {
            text: "To style components",
            isCorrect: false,
          },
          {
            text: "To make API calls",
            isCorrect: false,
          },
          {
            text: "To create class components",
            isCorrect: false,
          },
        ],
      },
    },
  });

  const _question2 = await prisma.question.create({
    data: {
      text: "What is the CAP theorem in distributed systems?",
      tags: ["system-design", "distributed-systems"],
      difficulty: "advanced",
      usageCount: 0,
      options: {
        create: [
          {
            text: "Consistency, Availability, Partition tolerance trade-off",
            isCorrect: true,
          },
          {
            text: "Cache, API, Performance optimization",
            isCorrect: false,
          },
          {
            text: "Create, Alter, Partition SQL commands",
            isCorrect: false,
          },
          {
            text: "Client, Application, Provider architecture",
            isCorrect: false,
          },
        ],
      },
    },
  });

  console.log("✅ Created quiz questions");

  // Create Onboarding Progress for user3 (in progress)
  console.log("🚀 Creating onboarding progress...");

  await prisma.onboardingProgress.create({
    data: {
      userId: user3.id,
      currentStep: 2, // Step 2 = EXPERIENCE
      path: null, // Haven't chosen path yet
      completedSteps: [1], // Completed step 1 (PROFILE)
      partialData: {
        name: "Sam Designer",
        region: "europe",
        currentRole: "UX/UI Designer",
        yearsExperience: 1,
      },
    },
  });

  console.log("✅ Created onboarding progress");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
