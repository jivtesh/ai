import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./styles/base.css";
import App from "./App";
import { startRouter } from "./state/router";
import { attachQaHooks } from "./lib/qaHooks";
import { startIdleWatch } from "./lib/idle";
import { startKiosk } from "./lib/kiosk";
import { startQualityWatch } from "./lib/quality";

startRouter();
attachQaHooks();
startIdleWatch();
startKiosk();
startQualityWatch();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
