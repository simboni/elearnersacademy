import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eLearners Academy",
    short_name: "eLearners",
    description: "Master trading, finance, and in-demand skills. Learn a lifetime skill that pays.",
    start_url: "/",
    display: "standalone",
    background_color: "#001931",
    theme_color: "#001931",
    icons: [
      { src: "/brand/logo.webp", sizes: "any", type: "image/webp" },
    ],
    categories: ["education", "finance"],
  };
}
