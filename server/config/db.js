import { execSync } from "child_process";
import prisma from "./prisma.js";

/**
 * Connect to PostgreSQL via Prisma and bootstrap schema/seed on empty cloud databases.
 */
const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not set. Database-backed routes will fail until configured.");
    return;
  }

  try {
    await prisma.$connect();
    console.log("🐘 PostgreSQL Connected successfully via Prisma");

    // Ensure schema exists and initial catalog is seeded on fresh deployments
    let count;
    try {
      count = await prisma.product.count();
    } catch (err) {
      if (err.code === "P2021" || /does not exist/i.test(err.message)) {
        console.log("🛠️ Fresh database detected — pushing Prisma schema...");
        execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
        count = await prisma.product.count();
      } else {
        throw err;
      }
    }

    if (count === 0) {
      console.log("🌱 Empty catalog detected — running initial seed...");
      execSync("node prisma/seed.js", { stdio: "inherit" });
    }
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    console.error("Please make sure your PostgreSQL database is running and DATABASE_URL in .env is correct.");
  }
};

export default connectDB;
