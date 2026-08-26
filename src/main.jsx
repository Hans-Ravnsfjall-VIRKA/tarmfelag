import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
async function evictLegacyServiceWorker() {
  let hadSW = false;
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      hadSW = regs.length > 0 || !!navigator.serviceWorker.controller;
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined" && caches.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
  }
  return hadSW;
}
(async () => {
  const hadSW = await evictLegacyServiceWorker();
  if (hadSW && !sessionStorage.getItem("tf:swcleared")) {
    sessionStorage.setItem("tf:swcleared", "1");
    window.location.reload();
    return;
  }
  createRoot(document.getElementById("root")).render(
    <React.StrictMode><App /></React.StrictMode>
  );
})();
