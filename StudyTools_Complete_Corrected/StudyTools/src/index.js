import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'StudyTools could not start because the "#root" element was not found.'
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the offline service worker only in production.
const isProduction =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "production";

if ("serviceWorker" in navigator && isProduction) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => {
        console.log("StudyTools offline support enabled.");
      })
      .catch((error) => {
        console.error("StudyTools service worker failed:", error);
      });
  });
}
