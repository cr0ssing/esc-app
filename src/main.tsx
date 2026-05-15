import { ConvexProvider, ConvexReactClient } from "convex/react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { MotionProvider } from "./components/MotionProvider";
import { getConvexUrl } from "./lib/convexUrl";

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
