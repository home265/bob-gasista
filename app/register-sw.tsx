"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const swUrl = "/sw.js";

    const onLoad = () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          // Log útil
          console.log("[SW] Registrado:", reg.scope);

          // Aviso cuando haya una nueva versión
          reg.addEventListener("updatefound", () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener("statechange", () => {
              if (nw.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("[SW] Nueva versión instalada (esperando activar).");
                } else {
                  console.log("[SW] Contenido cacheado para uso offline.");
                }
              }
            });
          });
        })
        .catch((err) => {
          console.warn("[SW] Error al registrar:", err);
        });
    };

    window.addEventListener("load", onLoad);

    // Si el SW toma control (actualización), recargamos una vez
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
