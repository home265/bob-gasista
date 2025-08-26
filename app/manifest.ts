// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calculadora Gas",
    short_name: "GasCalc",
    description: "Cálculo de materiales para instalaciones de gas. Funciona offline.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    //icons: [
    //  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    //  { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    //  { src: "/icon-512-maskable.png", sizes: "512x512", type: //"image/png", purpose: "maskable" }
   // ]
  };
}
