import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://khalilnooh.com",
  vite: {
    plugins: [tailwindcss()]
  }
});
