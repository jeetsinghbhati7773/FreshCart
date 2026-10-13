import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    //https: true,
    proxy: {
      "/api": {
        target: "https://hitman-grocery-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
