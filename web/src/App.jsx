import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Host from "./pages/Host";
import List from "./pages/List";
import Host_dashboard from "./pages/Host_dashboard";
import Explore from "./pages/Explore";
import About from "./pages/About";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import PropertyDetail from "./pages/PropertyDetail";
import Book from "./pages/Book";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/stays" element={<Explore />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/property" element={<PropertyDetail />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Host landing page — public, converts visitors */}
          <Route path="/host" element={<Host />} />

          {/* Protected: any authenticated user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected: booking — requires login (guest role enforced by backend) */}
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <Book />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <Book />
              </ProtectedRoute>
            }
          />

          {/* Protected: host-only routes */}
          <Route
            path="/host/list"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/Host_dashboard"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <Host_dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/dashboard"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <Host_dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: guest dashboard */}
          <Route
            path="/guest_dashboard"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
