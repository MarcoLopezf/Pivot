/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

// Load environment variables
config();

// Configure PrismaClient with pg adapter (same as infrastructure)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error"],
});

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
            tags: ["react"],
            difficulty: "beginner",
          },
          {
            title: "Build a Todo App",
            description: "Create a full-featured todo application with React",
            order: 2,
            status: "IN_PROGRESS",
            type: "PROJECT",
            tags: ["react"],
            difficulty: "beginner",
          },
          {
            title: "Learn Node.js & Express",
            description: "Backend development with Node.js and Express",
            order: 3,
            status: "PENDING",
            type: "THEORY",
            tags: ["node"],
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
            tags: ["system-design"],
            difficulty: "advanced",
          },
          {
            title: "Build a Scalable API",
            description: "Design and implement a production-grade REST API",
            order: 2,
            status: "PENDING",
            type: "PROJECT",
            tags: ["backend"],
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

  // Create Job Roles
  console.log("💼 Creating job roles...");

  await prisma.jobRole.createMany({
    data: [
      // Frontend (popularity: 80-95)
      {
        name: "Frontend Developer",
        category: "Frontend",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "React Developer",
        category: "Frontend",
        popularity: 95,
        isEnabled: true,
      },
      {
        name: "Vue.js Developer",
        category: "Frontend",
        popularity: 75,
        isEnabled: true,
      },
      {
        name: "Angular Developer",
        category: "Frontend",
        popularity: 70,
        isEnabled: true,
      },
      {
        name: "UI Developer",
        category: "Frontend",
        popularity: 80,
        isEnabled: true,
      },

      // Backend (popularity: 85-95)
      {
        name: "Backend Developer",
        category: "Backend",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "Node.js Developer",
        category: "Backend",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Python Developer",
        category: "Backend",
        popularity: 92,
        isEnabled: true,
      },
      {
        name: "Java Developer",
        category: "Backend",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "Go Developer",
        category: "Backend",
        popularity: 78,
        isEnabled: true,
      },
      {
        name: ".NET Developer",
        category: "Backend",
        popularity: 75,
        isEnabled: true,
      },
      {
        name: "Ruby Developer",
        category: "Backend",
        popularity: 65,
        isEnabled: true,
      },

      // Full Stack (popularity: 90-98)
      {
        name: "Full Stack Developer",
        category: "Full Stack",
        popularity: 98,
        isEnabled: true,
      },
      {
        name: "MERN Stack Developer",
        category: "Full Stack",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "MEAN Stack Developer",
        category: "Full Stack",
        popularity: 70,
        isEnabled: true,
      },
      {
        name: "Software Engineer",
        category: "Full Stack",
        popularity: 95,
        isEnabled: true,
      },

      // Data (popularity: 85-95)
      {
        name: "Data Scientist",
        category: "Data",
        popularity: 95,
        isEnabled: true,
      },
      {
        name: "Data Engineer",
        category: "Data",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "Machine Learning Engineer",
        category: "Data",
        popularity: 92,
        isEnabled: true,
      },
      {
        name: "Data Analyst",
        category: "Data",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "AI Engineer",
        category: "Data",
        popularity: 94,
        isEnabled: true,
      },

      // DevOps (popularity: 80-92)
      {
        name: "DevOps Engineer",
        category: "DevOps",
        popularity: 92,
        isEnabled: true,
      },
      {
        name: "Site Reliability Engineer",
        category: "DevOps",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Cloud Engineer",
        category: "DevOps",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "Platform Engineer",
        category: "DevOps",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "Infrastructure Engineer",
        category: "DevOps",
        popularity: 80,
        isEnabled: true,
      },

      // Mobile (popularity: 75-88)
      {
        name: "Mobile Developer",
        category: "Mobile",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "iOS Developer",
        category: "Mobile",
        popularity: 82,
        isEnabled: true,
      },
      {
        name: "Android Developer",
        category: "Mobile",
        popularity: 80,
        isEnabled: true,
      },
      {
        name: "React Native Developer",
        category: "Mobile",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Flutter Developer",
        category: "Mobile",
        popularity: 85,
        isEnabled: true,
      },

      // Security (popularity: 80-90)
      {
        name: "Security Engineer",
        category: "Security",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "Cybersecurity Analyst",
        category: "Security",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "Penetration Tester",
        category: "Security",
        popularity: 80,
        isEnabled: true,
      },
      {
        name: "Security Architect",
        category: "Security",
        popularity: 82,
        isEnabled: true,
      },

      // Quality (popularity: 70-82)
      {
        name: "QA Engineer",
        category: "Quality",
        popularity: 78,
        isEnabled: true,
      },
      {
        name: "Test Automation Engineer",
        category: "Quality",
        popularity: 82,
        isEnabled: true,
      },
      { name: "SDET", category: "Quality", popularity: 80, isEnabled: true },

      // Design (popularity: 75-88)
      {
        name: "UX Designer",
        category: "Design",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "UI Designer",
        category: "Design",
        popularity: 82,
        isEnabled: true,
      },
      {
        name: "Product Designer",
        category: "Design",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "UX Researcher",
        category: "Design",
        popularity: 75,
        isEnabled: true,
      },

      // Leadership & Other (popularity: 70-90)
      {
        name: "Engineering Manager",
        category: "Leadership",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "Technical Lead",
        category: "Leadership",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Solution Architect",
        category: "Architecture",
        popularity: 90,
        isEnabled: true,
      },
      {
        name: "Software Architect",
        category: "Architecture",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Product Manager",
        category: "Product",
        popularity: 87,
        isEnabled: true,
      },
      {
        name: "Technical Writer",
        category: "Other",
        popularity: 70,
        isEnabled: true,
      },
      {
        name: "Developer Advocate",
        category: "Other",
        popularity: 75,
        isEnabled: true,
      },
      {
        name: "Blockchain Developer",
        category: "Blockchain",
        popularity: 82,
        isEnabled: true,
      },
      {
        "name": "Smart Contract Developer",
        "category": "Blockchain",
        "popularity": 78,
        "isEnabled": true
      },
      {
        name: "Web3 Developer",
        category: "Blockchain",
        popularity: 80,
        isEnabled: true,
      },
      {
        name: "PHP Developer",
        category: "Backend",
        popularity: 82,
        isEnabled: true,
      },
      {
        name: "Rust Developer",
        category: "Backend",
        popularity: 73,
        isEnabled: true,
      },
      {
        name: "Game Developer",
        category: "Gaming",
        popularity: 78,
        isEnabled: true,
      },
      {
        name: "Unity Developer",
        category: "Gaming",
        popularity: 75,
        isEnabled: true,
      },
      {
        name: "Unreal Engine Developer",
        category: "Gaming",
        popularity: 72,
        isEnabled: true,
      },
      {
        name: "MLOps Engineer",
        category: "Data",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "AWS Cloud Engineer",
        category: "DevOps",
        popularity: 93,
        isEnabled: true,
      },
      {
        name: "Azure Cloud Engineer",
        category: "DevOps",
        popularity: 88,
        isEnabled: true,
      },
      {
        name: "Google Cloud Engineer",
        category: "DevOps",
        popularity: 85,
        isEnabled: true,
      },
      {
        name: "DevSecOps Engineer",
        category: "DevOps",
        popularity: 87,
        isEnabled: true,
      },
      {
        name: "Database Engineer",
        category: "Backend",
        popularity: 78,
        isEnabled: true,
      },
      {
        name: "Embedded Systems Engineer",
        category: "Specialized",
        popularity: 72,
        isEnabled: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created job roles");

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
