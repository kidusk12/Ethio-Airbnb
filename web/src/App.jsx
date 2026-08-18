import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home       from "./pages/Home";
import About      from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import BecomeHost from "./pages/BecomeHost";
import Terms      from "./pages/Terms";
import Dashboard  from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"             element={<Home />}       />
          <Route path="/about"        element={<About />}      />
          <Route path="/help"         element={<HelpCenter />} />
          <Route path="/become-a-host"element={<BecomeHost />} />
          <Route path="/terms"        element={<Terms />}      />
          <Route path="/dashboard"    element={<Dashboard />}  />
          {/* Catch-all */}
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
