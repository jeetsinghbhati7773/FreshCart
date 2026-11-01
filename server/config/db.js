import prisma from "./prisma.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("🐘 PostgreSQL Connected successfully via Prisma");
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    console.error("Please make sure your PostgreSQL database is running and DATABASE_URL in .env is correct.");
  }
};

export default connectDB;
