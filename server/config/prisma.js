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
    cart: {
      _id: {
        needs: { id: true },
        compute(cart) {
          return cart.id;
        },
      },
    },
    cartItem: {
      _id: {
        needs: { id: true },
        compute(item) {
          return item.id;
        },
      },
    },
    chatConversation: {
      _id: {
        needs: { id: true },
        compute(c) {
          return c.id;
        },
      },
    },
    chatMessage: {
      _id: {
        needs: { id: true },
        compute(m) {
          return m.id;
        },
      },
    },
    conversationSummary: {
      _id: {
        needs: { id: true },
        compute(s) {
          return s.id;
        },
      },
    },
    userMemory: {
      _id: {
        needs: { id: true },
        compute(m) {
          return m.id;
        },
      },
    },
    userMemorySetting: {
      _id: {
        needs: { id: true },
        compute(s) {
          return s.id;
        },
      },
    },
  },
});

export default prisma;
