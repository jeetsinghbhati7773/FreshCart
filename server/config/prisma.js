import { PrismaClient } from "@prisma/client";

const basePrisma = new PrismaClient();

// Add computed _id field to match MongoDB ObjectId expectations in frontend
const prisma = basePrisma.$extends({
  result: {
    user: {
      _id: {
        needs: { id: true },
        compute(user) {
          return user.id;
        },
      },
    },
    product: {
      _id: {
        needs: { id: true },
        compute(product) {
          return product.id;
        },
      },
    },
    order: {
      _id: {
        needs: { id: true },
        compute(order) {
          return order.id;
        },
      },
    },
    orderItem: {
      _id: {
        needs: { id: true },
        compute(item) {
          return item.id;
        },
      },
    },
    message: {
      _id: {
        needs: { id: true },
        compute(message) {
          return message.id;
        },
      },
    },
    otp: {
      _id: {
        needs: { id: true },
        compute(otp) {
          return otp.id;
        },
      },
    },
  },
});

export default prisma;
