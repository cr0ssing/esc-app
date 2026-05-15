import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
