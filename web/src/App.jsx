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
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/stays" element={<Explore />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/book" element={<Book />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/host" element={<Host />} />
          <Route path="/host/list" element={<List />} />
          <Route path="/host/Host_dashboard" element={<Host_dashboard />} />
          <Route path="/host/dashboard" element={<Host_dashboard />} />
          <Route path="/guest_dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;