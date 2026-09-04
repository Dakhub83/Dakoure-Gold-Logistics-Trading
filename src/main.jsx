import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ProducerOnboardingWizard from "./producer-onboarding/ProducerOnboardingWizard.tsx";
import "./index.css";

const showWizard = new URLSearchParams(window.location.search).has("producer-onboarding");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {showWizard ? <ProducerOnboardingWizard /> : <App />}
  </React.StrictMode>
);
