import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { MotionProvider } from "./components/MotionProvider";
import { getConvexUrl } from "./lib/convexUrl";
import { syncStandalonePwaAttribute } from "./lib/standaloneDisplayMode";

syncStandalonePwaAttribute();

for (const query of ["(display-mode: standalone)", "(display-mode: fullscreen)"] as const) {
  window.matchMedia(query).addEventListener("change", syncStandalonePwaAttribute);
}

const convexUrl = getConvexUrl();

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <MotionProvider>
        <App />
      </MotionProvider>
    </ConvexProvider>
  </React.StrictMode>,
);
