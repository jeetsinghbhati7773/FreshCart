import prisma from "../config/prisma.js";

const counts = await prisma.product.groupBy({ by: ["category"], _count: { id: true } });
console.table(counts);
await prisma.$disconnect();

