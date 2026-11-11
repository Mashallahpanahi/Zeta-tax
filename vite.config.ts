
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Required for Electron production builds
    base: "./",

    server: {
      port: Number(env.VITE_FRONTEND_PORT) || 4000,
    },
  };
});
